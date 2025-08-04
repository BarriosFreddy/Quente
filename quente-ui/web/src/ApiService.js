import axios from 'axios'

const { REACT_APP_BASE_URL } = process.env
const MAX_RETRY_ATTEMPTS = 2

const axiosInstance = axios.create({
  baseURL: REACT_APP_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
})

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        const refreshResponse = await axios({
          url: `${REACT_APP_BASE_URL}/api/v1/auth/refresh-token`,
          method: 'POST',
          withCredentials: true,
        })

        // If refresh successful, retry the original request
        if (refreshResponse.status === 200) {
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export const ApiService = {
  async post(uri, data) {
    return retry(() =>
      axiosInstance({
        url: uri,
        method: 'POST',
        data,
      }),
    )
  },
  async put(uri, data) {
    return await retry(() =>
      axiosInstance({
        url: uri,
        method: 'PUT',
        withCredentials: true,
        data,
      }),
    )
  },
  async delete(uri) {
    return await retry(() =>
      axiosInstance({
        url: uri,
        method: 'DELETE',
        withCredentials: true,
      }),
    )
  },
  async get(uri) {
    return await retry(() =>
      axiosInstance({
        url: uri,
        method: 'GET',
        withCredentials: true,
      }),
    )
  },
  async patch(uri, data) {
    return await retry(() =>
      axiosInstance({
        url: uri,
        method: 'PATCH',
        withCredentials: true,
        data,
      }),
    )
  },
  // Check if server is reachable
  async checkConnection() {
    try {
      const response = await axiosInstance({
        url: '/api/v1/health',
        method: 'GET',
        timeout: 5000, // Short timeout for quick check
      })
      return response.status >= 200 && response.status < 300
    } catch (error) {
      console.error('Server connection check failed:', error)
      return false
    }
  },
}

async function retry(request, retryAttempts = 0) {
  let response = null
  try {
    response = await request()
    if (![200, 201, 202].includes(response.status)) {
      console.error('ERROR ', response)
      // Handle 401 Unauthorized after max retries
      if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
        let persistAuth = localStorage.getItem('persist:auth')
        persistAuth = JSON.parse(persistAuth)
        persistAuth.isLoggedIn = false
        localStorage.setItem('persist:auth', JSON.stringify(persistAuth))
        redirectToLogin()
        return response
      }
      return await retry(request, ++retryAttempts)
    }
    return response
  } catch (error) {
    if (retryAttempts >= MAX_RETRY_ATTEMPTS) return response
    return await retry(request, ++retryAttempts)
  }
}

// Helper function to redirect to login page
function redirectToLogin() {
  // Skip redirection if already on a login page
  const currentPath = window.location.pathname
  if (currentPath === '/login' || currentPath === '/admin/login') {
    return
  }

  // Use the current URL to determine the base path
  const basePath = currentPath.startsWith('/admin') ? '/admin/login' : '/login'

  // Store the current location to redirect back after login (if not a login page)
  sessionStorage.setItem('redirectAfterLogin', currentPath)

  // Redirect to login page
  window.location.href = basePath
}
