import React, { useState, useEffect } from 'react'
import { Modal, Button, Table, Form } from 'react-bootstrap'
import './ConflictResolution.scss'
import PropTypes from 'prop-types'

/**
 * Component for resolving data conflicts
 * @param {Object} props Component props
 * @param {Array} props.conflicts Array of conflicts to resolve
 * @param {Function} props.onResolve Function to call when conflicts are resolved
 * @param {Function} props.onCancel Function to call when resolution is cancelled
 * @param {boolean} props.show Whether to show the dialog
 * @returns {JSX.Element} The ConflictResolution component
 */
const ConflictResolution = ({ conflicts = [], onResolve, onCancel, show = false }) => {
  const [resolutions, setResolutions] = useState({})
  const [globalStrategy, setGlobalStrategy] = useState('smart')

  // Initialize resolutions when conflicts change
  useEffect(() => {
    if (conflicts.length > 0) {
      const initialResolutions = {}
      conflicts.forEach((conflict, index) => {
        initialResolutions[index] = {
          strategy: 'smart',
          resolved: false,
          result: null,
        }
      })
      setResolutions(initialResolutions)
    }
  }, [conflicts])

  // Apply global strategy to all unresolved conflicts
  const applyGlobalStrategy = () => {
    const updatedResolutions = { ...resolutions }

    Object.keys(updatedResolutions).forEach((index) => {
      if (!updatedResolutions[index].resolved) {
        updatedResolutions[index].strategy = globalStrategy
      }
    })

    setResolutions(updatedResolutions)
  }

  // Handle strategy change for a specific conflict
  const handleStrategyChange = (index, strategy) => {
    setResolutions({
      ...resolutions,
      [index]: {
        ...resolutions[index],
        strategy,
      },
    })
  }

  // Handle manual resolution of a conflict
  const handleManualResolve = (index, field, value) => {
    const conflict = conflicts[index]
    const local = { ...conflict.local }
    const server = { ...conflict.server }

    // Create a merged version
    const merged = { ...server }
    merged[field] = value

    setResolutions({
      ...resolutions,
      [index]: {
        ...resolutions[index],
        resolved: true,
        result: merged,
      },
    })
  }

  // Handle resolution of all conflicts
  const handleResolveAll = () => {
    const resolvedItems = conflicts.map((conflict, index) => {
      const resolution = resolutions[index]

      // If already manually resolved, use that result
      if (resolution.resolved && resolution.result) {
        return resolution.result
      }

      // Otherwise, apply the selected strategy
      const { local, server } = conflict
      const strategy = resolution.strategy

      switch (strategy) {
        case 'local':
          return {
            ...server,
            ...local,
            syncStatus: 'pending',
          }
        case 'server':
          return {
            ...server,
            syncStatus: 'synced',
          }
        case 'smart':
        default:
          // Smart merge - field by field comparison
          const merged = { ...server }

          // For each field in the local version
          Object.keys(local).forEach((key) => {
            // Skip metadata fields
            if (['_id', 'id', 'createdAt', 'syncStatus'].includes(key)) {
              return
            }

            // If the field has been modified locally
            if (JSON.stringify(local[key]) !== JSON.stringify(server[key])) {
              // Prefer local changes for specific fields
              if (['name', 'description', 'price', 'billAmount'].includes(key)) {
                merged[key] = local[key]
              }
            }
          })

          // Mark as pending sync if we made changes
          merged.syncStatus =
            JSON.stringify(merged) !== JSON.stringify(server) ? 'pending' : 'synced'

          return merged
      }
    })

    if (onResolve) {
      onResolve(resolvedItems)
    }
  }

  // Render a field comparison row
  const renderFieldComparison = (conflict, index, field) => {
    const localValue = conflict.local[field]
    const serverValue = conflict.server[field]
    const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue)

    if (!isDifferent) {
      return null
    }

    return (
      <tr key={`${index}-${field}`} className="conflict-field-row">
        <td>{field}</td>
        <td className="conflict-value local-value">
          {typeof localValue === 'object' ? JSON.stringify(localValue) : String(localValue)}
        </td>
        <td className="conflict-value server-value">
          {typeof serverValue === 'object' ? JSON.stringify(serverValue) : String(serverValue)}
        </td>
        <td>
          <Form.Check
            type="radio"
            name={`resolution-${index}-${field}`}
            id={`local-${index}-${field}`}
            label="Local"
            onChange={() => handleManualResolve(index, field, localValue)}
          />
          <Form.Check
            type="radio"
            name={`resolution-${index}-${field}`}
            id={`server-${index}-${field}`}
            label="Server"
            defaultChecked
            onChange={() => handleManualResolve(index, field, serverValue)}
          />
        </td>
      </tr>
    )
  }

  return (
    <Modal show={show} onHide={onCancel} size="lg" centered className="conflict-resolution-modal">
      <Modal.Header closeButton>
        <Modal.Title>Resolve Data Conflicts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="global-strategy">
          <Form.Group>
            <Form.Label>Global Resolution Strategy:</Form.Label>
            <Form.Select value={globalStrategy} onChange={(e) => setGlobalStrategy(e.target.value)}>
              <option value="smart">Smart Merge (Recommended)</option>
              <option value="local">Prefer Local Changes</option>
              <option value="server">Prefer Server Changes</option>
            </Form.Select>
          </Form.Group>
          <Button variant="outline-primary" size="sm" onClick={applyGlobalStrategy}>
            Apply to All
          </Button>
        </div>

        <div className="conflicts-container">
          {conflicts.map((conflict, index) => (
            <div key={index} className="conflict-item-container">
              <h5>
                Conflict #{index + 1}: {conflict.local.name || conflict.local._id}
              </h5>
              <div className="conflict-metadata">
                <div>
                  <strong>Local Updated:</strong>{' '}
                  {new Date(conflict.local.updatedAt).toLocaleString()}
                </div>
                <div>
                  <strong>Server Updated:</strong>{' '}
                  {new Date(conflict.server.updatedAt).toLocaleString()}
                </div>
              </div>

              <Form.Group className="conflict-strategy-select">
                <Form.Label>Resolution Strategy:</Form.Label>
                <Form.Select
                  value={resolutions[index]?.strategy || 'smart'}
                  onChange={(e) => handleStrategyChange(index, e.target.value)}
                  disabled={resolutions[index]?.resolved}
                >
                  <option value="smart">Smart Merge</option>
                  <option value="local">Prefer Local</option>
                  <option value="server">Prefer Server</option>
                </Form.Select>
              </Form.Group>

              <Table striped bordered hover size="sm" className="conflict-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Local Value</th>
                    <th>Server Value</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(conflict.local)
                    .filter((key) => !['_id', 'id', 'createdAt', 'syncStatus', '__v'].includes(key))
                    .map((field) => renderFieldComparison(conflict, index, field))}
                </tbody>
              </Table>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleResolveAll}>
          Resolve All Conflicts
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConflictResolution

ConflictResolution.propTypes = {
  conflicts: PropTypes.array.isRequired,
  onCancel: PropTypes.func.isRequired,
  onResolve: PropTypes.func.isRequired,
  show: PropTypes.bool,
}
