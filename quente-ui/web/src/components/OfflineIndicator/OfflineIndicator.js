import React, { useState, useEffect } from 'react'
import './OfflineIndicator.scss'

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(!navigator.onLine)

  useEffect(() => {
    // Function to update online status
    const handleStatusChange = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        // Show banner immediately when going offline
        setShowBanner(true)
      } else {
        // When coming back online, show "You're back online" message
        // and then hide after a delay
        setShowBanner(true)
        setTimeout(() => {
          setShowBanner(false)
        }, 3000)
      }
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

  // Don't render anything if we're online and the banner is hidden
  if (isOnline && !showBanner) {
    return null
  }

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-indicator-content">
        <span className="offline-indicator-icon">{isOnline ? '🟢' : '🔴'}</span>
        <span className="offline-indicator-text">
          {isOnline
            ? 'Estás en línea nuevamente'
            : 'Estás sin conexión. Algunas caracterásticas pueden estar limitadas.'}
        </span>
        {showBanner && isOnline && (
          <button className="offline-indicator-close" onClick={() => setShowBanner(false)}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default OfflineIndicator
