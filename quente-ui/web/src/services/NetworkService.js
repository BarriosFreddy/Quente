import isOnline from 'is-online'

class NetworkService {
  constructor() {
    this.isOnline = true
    this.listeners = []

    // Initialize and set up listeners
    this.initialize()
  }

  initialize() {
    // Check initial status
    this.checkConnection()

    // Set up event listeners for online/offline events
    window.addEventListener('online', () => this.handleConnectionChange(true))
    window.addEventListener('offline', () => this.handleConnectionChange(false))

    // Periodically check connection status
    setInterval(() => this.checkConnection(), 30000) // Check every 30 seconds
  }

  async checkConnection() {
    try {
      const online = await isOnline()
      if (this.isOnline !== online) {
        this.handleConnectionChange(online)
      }
    } catch (error) {
      console.error('Failed to check online status:', error)
    }
  }

  handleConnectionChange(online) {
    const previousState = this.isOnline
    this.isOnline = online

    // Only notify if state actually changed
    if (previousState !== online) {
      this.notifyListeners()

      // Log state change
      console.log(`Connection status changed: ${online ? 'Online' : 'Offline'}`)
    }
  }

  addListener(callback) {
    if (typeof callback === 'function' && !this.listeners.includes(callback)) {
      this.listeners.push(callback)

      // Immediately call with current status
      callback(this.isOnline)

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

  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.isOnline)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }

  getStatus() {
    return this.isOnline
  }
}

const networkService = new NetworkService()
export default networkService
