/**
 * Utility functions for handling data conflicts during synchronization
 */

/**
 * Compare two versions of the same entity and determine if there's a conflict
 * @param {Object} localVersion The local version of the entity
 * @param {Object} serverVersion The server version of the entity
 * @returns {boolean} True if there's a conflict, false otherwise
 */
export const hasConflict = (localVersion, serverVersion) => {
  // If either version doesn't exist, there's no conflict
  if (!localVersion || !serverVersion) {
    return false
  }

  // Compare updatedAt timestamps if available
  if (localVersion.updatedAt && serverVersion.updatedAt) {
    const localDate = new Date(localVersion.updatedAt)
    const serverDate = new Date(serverVersion.updatedAt)

    // If the server version is newer, there's a conflict
    return serverDate > localDate
  }

  // If we can't determine based on timestamps, assume there's a conflict
  return true
}

/**
 * Merge two versions of the same entity
 * @param {Object} localVersion The local version of the entity
 * @param {Object} serverVersion The server version of the entity
 * @param {string} strategy The merge strategy ('local', 'server', 'smart')
 * @returns {Object} The merged entity
 */
export const mergeEntities = (localVersion, serverVersion, strategy = 'smart') => {
  // If either version doesn't exist, return the other
  if (!localVersion) return serverVersion
  if (!serverVersion) return localVersion

  switch (strategy) {
    case 'local':
      // Always prefer local changes
      return {
        ...serverVersion,
        ...localVersion,
        syncStatus: 'pending',
      }

    case 'server':
      // Always prefer server changes
      return {
        ...serverVersion,
        syncStatus: 'synced',
      }

    case 'smart':
    default:
      // Smart merge - field by field comparison
      const merged = { ...serverVersion }

      // For each field in the local version
      Object.keys(localVersion).forEach((key) => {
        // Skip metadata fields
        if (['_id', 'id', 'createdAt', 'syncStatus'].includes(key)) {
          return
        }

        // If the field has been modified locally
        if (JSON.stringify(localVersion[key]) !== JSON.stringify(serverVersion[key])) {
          // Prefer local changes for specific fields
          if (['name', 'description', 'price', 'billAmount'].includes(key)) {
            merged[key] = localVersion[key]
          }
        }
      })

      // Mark as pending sync if we made changes
      merged.syncStatus =
        JSON.stringify(merged) !== JSON.stringify(serverVersion) ? 'pending' : 'synced'

      return merged
  }
}

/**
 * Resolve conflicts between local and server versions
 * @param {Array} localEntities Array of local entities
 * @param {Array} serverEntities Array of server entities
 * @param {string} strategy The merge strategy ('local', 'server', 'smart')
 * @returns {Object} Object containing merged entities and conflicts
 */
export const resolveConflicts = (localEntities, serverEntities, strategy = 'smart') => {
  const result = {
    merged: [],
    conflicts: [],
  }

  // Create a map of server entities by ID for quick lookup
  const serverEntitiesMap = serverEntities.reduce((map, entity) => {
    map[entity._id] = entity
    return map
  }, {})

  // Create a map of local entities by ID for quick lookup
  const localEntitiesMap = localEntities.reduce((map, entity) => {
    map[entity._id] = entity
    return map
  }, {})

  // Process all local entities
  localEntities.forEach((localEntity) => {
    const serverEntity = serverEntitiesMap[localEntity._id]

    // If there's a conflict
    if (hasConflict(localEntity, serverEntity)) {
      // Add to conflicts list
      result.conflicts.push({
        local: localEntity,
        server: serverEntity,
      })

      // Merge according to strategy
      result.merged.push(mergeEntities(localEntity, serverEntity, strategy))
    } else {
      // No conflict, just add the local entity
      result.merged.push(localEntity)
    }
  })

  // Add server entities that don't exist locally
  serverEntities.forEach((serverEntity) => {
    if (!localEntitiesMap[serverEntity._id]) {
      result.merged.push(serverEntity)
    }
  })

  return result
}

const conflictResolution = {
  hasConflict,
  mergeEntities,
  resolveConflicts,
}
export default conflictResolution
