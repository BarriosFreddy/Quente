import React, { useState, useEffect } from 'react'
import syncService from '../../services/SyncService'
import networkService from '../../services/NetworkService'
import './SyncStatus.scss'

const SyncStatus = () => {
  const [isOnline, setIsOnline] = useState(networkService.getStatus())
  const [syncStatus, setSyncStatus] = useState({
    status: 'idle',
    message: 'Listo para sincronizar',
    lastSyncTime: syncService.getLastSyncTime(),
    conflicts: [],
  })
  const [showDetails, setShowDetails] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [conflictStrategy, setConflictStrategy] = useState('smart')

  useEffect(() => {
    // Listen for network status changes
    const networkListener = (online) => {
      setIsOnline(online)
    }

    // Listen for sync status changes
    const syncListener = (status) => {
      setSyncStatus(status)

      // If there are conflicts, show the details
      if (status.conflicts && status.conflicts.length > 0) {
        setShowDetails(true)
        setShowConflicts(true)
      }
    }

    // Register listeners
    networkService.addListener(networkListener)
    syncService.addListener(syncListener)

    // Start periodic sync (every 5 minutes)
    syncService.schedulePeriodicSync(5)

    // Clean up on unmount
    return () => {
      networkService.removeListener(networkListener)
      syncService.removeListener(syncListener)
      syncService.stopPeriodicSync()
    }
  }, [])

  const handleManualSync = () => {
    if (!syncService.isSyncing() && isOnline) {
      syncService.syncData(conflictStrategy)
    }
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleTimeString()
  }

  const getStatusIcon = () => {
    if (!isOnline) return '🔴' // Offline

    switch (syncStatus.status) {
      case 'syncing':
        return '🔄' // Syncing
      case 'completed':
        return '✅' // Success
      case 'failed':
        return '⚠️' // Failed
      default:
        return '🔵' // Idle
    }
  }

  const hasConflicts = syncStatus.conflicts && syncStatus.conflicts.length > 0

  return (
    <div className="sync-status-container">
      <button className="sync-status" onClick={() => setShowDetails(!showDetails)}>
        <span className="sync-icon">{getStatusIcon()}</span>
        <span className="sync-text">
          {isOnline ? 'Online' : 'Offline'}
          {isOnline && syncStatus.status === 'syncing' && ' - Syncing...'}
          {hasConflicts && ' - Conflicts detected'}
        </span>
      </button>

      {showDetails && (
        <div className="sync-details">
          <div className="sync-detail-item">
            <span>Estado:</span>
            <span>{syncStatus.status}</span>
          </div>
          <div className="sync-detail-item">
            <span>Ultima sincronización:</span>
            <span>{formatTime(syncStatus.lastSyncTime)}</span>
          </div>
          {syncStatus.message && (
            <div className="sync-detail-item">
              <span>Mensaje:</span>
              <span>{syncStatus.message}</span>
            </div>
          )}
          {syncStatus.processedCount !== undefined && (
            <div className="sync-detail-item">
              <span>Items sincronizados:</span>
              <span>{syncStatus.processedCount}</span>
            </div>
          )}

          {hasConflicts && (
            <div className="sync-conflicts">
              <button
                className="sync-detail-item conflicts-header"
                onClick={() => setShowConflicts(!showConflicts)}
              >
                <span>Conflicts:</span>
                <span>
                  {syncStatus.conflicts.length} {showConflicts ? '▲' : '▼'}
                </span>
              </button>

              {showConflicts && (
                <>
                  <div className="conflict-strategy">
                    <span>Estrategia de resolución:</span>
                    <select
                      value={conflictStrategy}
                      onChange={(e) => setConflictStrategy(e.target.value)}
                    >
                      <option value="smart">Resolución inteligente</option>
                      <option value="local">Prefiere Local</option>
                      <option value="server">Prefiere Servidor</option>
                    </select>
                  </div>

                  <div className="conflicts-list">
                    {syncStatus.conflicts.slice(0, 3).map((conflict, index) => (
                      <div key={index} className="conflict-item">
                        <div>Item: {conflict.local.name || conflict.local._id}</div>
                        <div className="conflict-details">
                          <div>Local: {new Date(conflict.local.updatedAt).toLocaleString()}</div>
                          <div>Server: {new Date(conflict.server.updatedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                    {syncStatus.conflicts.length > 3 && (
                      <div className="conflict-more">
                        +{syncStatus.conflicts.length - 3} more conflicts
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            className="sync-button"
            onClick={handleManualSync}
            disabled={!isOnline || syncService.isSyncing()}
          >
            {syncService.isSyncing() ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SyncStatus
