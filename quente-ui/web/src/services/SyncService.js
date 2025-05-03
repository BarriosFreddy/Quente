import db from './DatabaseService'
import networkService from './NetworkService'
import { ApiService } from '../ApiService'
import { resolveConflicts } from '../utils/conflictResolution'

class SyncService {
  constructor() {
    this.syncInProgress = false
    this.lastSyncTime = null
    this.listeners = []

    // Set up network status listener
    networkService.addListener(this.handleNetworkChange.bind(this))
  }

  async handleNetworkChange(isOnline) {
    if (isOnline) {
      // When coming back online, attempt to sync
      console.log('Network is back online, attempting to sync...')
      await this.syncData()
    } else {
      console.log('Network is offline, sync paused')
    }
  }

  async syncData(conflictStrategy = 'smart') {
    // Prevent multiple syncs from running simultaneously
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping')
      return {
        success: false,
        message: 'Sync already in progress',
      }
    }

    // Check if we're online
    if (!networkService.getStatus()) {
      console.log('Cannot sync while offline')
      return {
        success: false,
        message: 'Cannot sync while offline',
      }
    }

    try {
      this.syncInProgress = true
      this.notifyListeners({ status: 'syncing', message: 'Sync in progress' })

      // Process the sync queue first
      const queueResult = await this.processSyncQueue()

      // Then sync data with the server
      const syncResult = await this.syncWithServer(conflictStrategy)

      // Update last sync time
      this.lastSyncTime = new Date()

      // Notify listeners of completion
      this.notifyListeners({
        status: syncResult.success ? 'completed' : 'failed',
        message: syncResult.message,
        lastSyncTime: this.lastSyncTime,
        processedCount: queueResult.processedCount,
        conflicts: syncResult.conflicts || [],
      })

      return {
        success: syncResult.success,
        message: syncResult.message,
        processedCount: queueResult.processedCount,
        conflicts: syncResult.conflicts || [],
      }
    } catch (error) {
      console.error('Sync failed with error:', error)

      this.notifyListeners({
        status: 'failed',
        message: 'Sync failed with error',
        error: error.message,
      })

      return {
        success: false,
        message: 'Sync failed with error: ' + error.message,
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async processSyncQueue() {
    try {
      // Get all items from the sync queue
      const queue = await db.syncQueue.toArray()
      let processedCount = 0

      // Process each item in the queue
      for (const item of queue) {
        try {
          let response

          switch (item.operation) {
            case 'create':
              response = await ApiService.post(`/${item.entity}`, item.data)
              break
            case 'update':
              response = await ApiService.put(`/${item.entity}/${item.data._id}`, item.data)
              break
            case 'delete':
              response = await ApiService.delete(`/${item.entity}/${item.data._id}`)
              break
            default:
              break
          }

          if (response && response.status >= 200 && response.status < 300) {
            // If successful, remove from queue
            await db.syncQueue.delete(item._id)
            processedCount++

            // Update local record with server data if needed
            if (response.data && (item.operation === 'create' || item.operation === 'update')) {
              const table = db.table(item.entity)
              await table.put({
                ...response.data,
                syncStatus: 'synced',
              })
            }
          }
        } catch (error) {
          console.error(`Failed to process sync item: ${item._id}`, error)
        }
      }

      return { processedCount }
    } catch (error) {
      console.error('Error processing sync queue:', error)
      return { processedCount: 0 }
    }
  }

  async syncWithServer(conflictStrategy = 'smart') {
    try {
      // Get the last sync time
      const lastSync = this.lastSyncTime ? this.lastSyncTime.toISOString() : null

      // Fetch changes from the server
      const response = await ApiService.get(`/sync/changes${lastSync ? `?since=${lastSync}` : ''}`)

      if (!response || response.status !== 200) {
        return {
          success: false,
          message: 'Failed to fetch changes from server',
        }
      }

      const serverChanges = response.data.changes
      const conflicts = {
        items: [],
        billings: [],
      }

      // Sync items
      if (serverChanges.items && serverChanges.items.length > 0) {
        // Get local items with pending changes
        const pendingItems = await db.items
          .filter((item) => item.syncStatus === 'pending')
          .toArray()

        // Resolve conflicts
        const resolvedItems = resolveConflicts(pendingItems, serverChanges.items, conflictStrategy)

        // Store conflicts for reporting
        conflicts.items = resolvedItems.conflicts

        // Update local database with resolved items
        for (const item of resolvedItems.merged) {
          await db.items.put(item)
        }
      }

      // Sync billings
      if (serverChanges.billings && serverChanges.billings.length > 0) {
        // Get local billings with pending changes
        const pendingBillings = await db.billings
          .filter((billing) => billing.syncStatus === 'pending')
          .toArray()

        // Resolve conflicts
        const resolvedBillings = resolveConflicts(
          pendingBillings,
          serverChanges.billings,
          conflictStrategy,
        )

        // Store conflicts for reporting
        conflicts.billings = resolvedBillings.conflicts

        // Update local database with resolved billings
        for (const billing of resolvedBillings.merged) {
          await db.billings.put(billing)
        }
      }

      return {
        success: true,
        message: 'Sync completed successfully',
        conflicts: [...conflicts.items, ...conflicts.billings],
      }
    } catch (error) {
      console.error('Error syncing with server:', error)
      return {
        success: false,
        message: 'Error syncing with server: ' + error.message,
      }
    }
  }

  addListener(callback) {
    if (typeof callback === 'function' && !this.listeners.includes(callback)) {
      this.listeners.push(callback)
      return true
    }
    return false
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
      return true
    }
    return false
  }

  notifyListeners(status) {
    this.listeners.forEach((callback) => {
      try {
        callback(status)
      } catch (error) {
        console.error('Error in sync status listener:', error)
      }
    })
  }

  getLastSyncTime() {
    return this.lastSyncTime
  }

  isSyncing() {
    return this.syncInProgress
  }

  // Schedule periodic sync
  schedulePeriodicSync(intervalMinutes = 15) {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Set up new interval
    this.syncInterval = setInterval(() => {
      if (networkService.getStatus() && !this.syncInProgress) {
        this.syncData()
      }
    }, intervalMinutes * 60 * 1000)

    return this.syncInterval
  }

  // Stop periodic sync
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      return true
    }
    return false
  }
}

const syncService = new SyncService()
export default syncService
