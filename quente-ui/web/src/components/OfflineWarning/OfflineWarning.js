import React from 'react'
import useOfflineStatus from '../../hooks/useOfflineStatus'
import './OfflineWarning.scss'
import PropTypes from 'prop-types'

/**
 * Component to display a warning when a user is trying to perform an action while offline
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the warning
 * @param {Function} props.onClose Function to call when the warning is closed
 * @param {string} props.message Custom message to display
 * @returns {JSX.Element|null} The OfflineWarning component
 */
const OfflineWarning = ({ show = true, onClose, message }) => {
  const { isOffline } = useOfflineStatus()

  // Don't render anything if we're online or the warning is not meant to be shown
  if (!isOffline || !show) {
    return null
  }

  return (
    <div className="offline-warning">
      <div className="offline-warning-content">
        <div className="offline-warning-icon">⚠️</div>
        <div className="offline-warning-message">
          {message ||
            'Actualmente, estás sin conexión. Está acción será sincronizada cuando vuelvas a estar en línea'}
        </div>
        {onClose && (
          <button className="offline-warning-close" onClick={onClose} aria-label="Close warning">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default OfflineWarning

OfflineWarning.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.string,
}
