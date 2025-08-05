import React, { useState } from 'react'
import useOfflineStatus from '../hooks/useOfflineStatus'
import OfflineWarning from '../components/OfflineWarning'

/**
 * Higher-order component that adds offline capability to a component
 * @param {React.ComponentType} WrappedComponent The component to wrap
 * @returns {React.ComponentType} The wrapped component with offline capability
 */
const withOfflineCapability = (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    const { isOffline } = useOfflineStatus()
    const [showOfflineWarning, setShowOfflineWarning] = useState(false)

    // Function to handle form submission
    const handleSubmit = async (data, originalSubmitFn) => {
      // If we're offline, show a warning
      if (isOffline) {
        setShowOfflineWarning(true)

        // Store the data in the local database via the DatabaseService
        try {
          // Dynamically import to avoid SSR issues
          const { default: db } = await import('../services/DatabaseService')

          // Determine the entity type based on the data
          let entity = 'items'
          if (data.billAmount !== undefined) {
            entity = 'billings'
          }

          // Add to the sync queue
          await db.addToSyncQueue(entity, data._id ? 'update' : 'create', data)

          // Close the warning after a delay
          setTimeout(() => {
            setShowOfflineWarning(false)
          }, 3000)

          return { success: true, offline: true, data }
        } catch (error) {
          console.error('Failed to store offline data:', error)
          return { success: false, error: error.message }
        }
      }

      // If we're online, just call the original submit function
      return originalSubmitFn(data)
    }

    return (
      <>
        <WrappedComponent {...props} isOffline={isOffline} handleSubmit={handleSubmit} />
        <OfflineWarning show={showOfflineWarning} onClose={() => setShowOfflineWarning(false)} />
      </>
    )
  }
}

export default withOfflineCapability
