import { useState, useEffect, useCallback } from 'react'
import db from '../services/DatabaseService'
import networkService from '../services/NetworkService'
import syncService from '../services/SyncService'
import { ApiService } from '../ApiService'

export function useItems(filter = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load items from database
  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const data = await db.getItems(filter)
      setItems(data)
      setError(null)
    } catch (err) {
      console.error('Error loading items:', err)
      setError(err.message || 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Save an item
  const saveItem = useCallback(
    async (item) => {
      try {
        const isOnline = networkService.getStatus()
        const savedItem = await db.saveItem(item, isOnline, ApiService)

        // Refresh the list
        await loadItems()

        return savedItem
      } catch (err) {
        console.error('Error saving item:', err)
        throw err
      }
    },
    [loadItems],
  )

  // Initial load
  useEffect(() => {
    loadItems()
  }, [loadItems])

  return {
    items,
    loading,
    error,
    saveItem,
    refreshItems: loadItems,
  }
}

export function useBillings(filter = {}) {
  const [billings, setBillings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load billings from database
  const loadBillings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await db.getBillings(filter)
      setBillings(data)
      setError(null)
    } catch (err) {
      console.error('Error loading billings:', err)
      setError(err.message || 'Failed to load billings')
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Save a billing
  const saveBilling = useCallback(
    async (billing) => {
      try {
        const isOnline = networkService.getStatus()
        const savedBilling = await db.saveBilling(billing, isOnline, ApiService)

        // Refresh the list
        await loadBillings()

        return savedBilling
      } catch (err) {
        console.error('Error saving billing:', err)
        throw err
      }
    },
    [loadBillings],
  )

  // Initial load
  useEffect(() => {
    loadBillings()
  }, [loadBillings])

  return {
    billings,
    loading,
    error,
    saveBilling,
    refreshBillings: loadBillings,
  }
}

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(networkService.getStatus())
  const [syncState, setSyncState] = useState({
    status: 'idle',
    lastSyncTime: null,
    message: '',
  })

  useEffect(() => {
    // Listen for network status changes
    const networkListener = (online) => {
      setIsOnline(online)
    }

    // Listen for sync status changes
    const syncListener = (status) => {
      setSyncState(status)
    }

    // Register listeners
    networkService.addListener(networkListener)
    syncService.addListener(syncListener)

    // Clean up on unmount
    return () => {
      networkService.removeListener(networkListener)
      syncService.removeListener(syncListener)
    }
  }, [])

  const triggerSync = useCallback(async () => {
    if (isOnline) {
      return await syncService.syncData()
    }
    return { success: false, message: 'Cannot sync while offline' }
  }, [isOnline])

  return {
    isOnline,
    syncState,
    triggerSync,
  }
}
