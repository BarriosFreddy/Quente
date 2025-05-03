import { useState, useEffect } from 'react'

/**
 * Custom hook to track online/offline status
 * @returns {Object} Object containing isOnline status and related methods
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Function to update online status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    // Add event listeners
    window.addEventListener('online', handleStatusChange)
    window.addEventListener('offline', handleStatusChange)

    // Clean up
    return () => {
      window.removeEventListener('online', handleStatusChange)
      window.removeEventListener('offline', handleStatusChange)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
  }
}

export default useOfflineStatus
