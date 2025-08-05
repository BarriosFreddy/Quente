import billingsRepository from '@/modules/billing/services/billings.repository'
import axios from 'axios'
/**
 *
 */
const { VITE_APP_BASE_URL } = import.meta.env
const MAX_RETRY_ATTEMPTS = 3
const INTERVAL_TIME = 1000 * 60 * 60
const SAVE_BILLING_ENDPOINT = '/billings'
const CREATED_HTTPCODE = 201

const axiosInstance = axios.create({
  baseURL: VITE_APP_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
})

const exportBillings = async () => {
  const localBillings = await billingsRepository.find({ size: 10 })
  console.log('Objects in memory: ', localBillings.length)
  if (localBillings.length > 0) {
    for (const localBilling of localBillings) {
      const localBillingId = localBilling.id
      console.log('Processing object with id: ', localBillingId)
      delete localBilling.id
      localBilling.clientId = '65ac390a0276b80f5712a96c' // default client id
      const response = await retry(() =>
        axiosInstance({
          url: SAVE_BILLING_ENDPOINT,
          method: 'POST',
          data: localBilling,
        }),
      )
      if (response && response.status === CREATED_HTTPCODE) {
        const deleteResponse = await billingsRepository.deleteById(localBillingId)
        deleteResponse && console.log('Delete object: ', localBillingId)
      }
    }
  }
}

export const executeTasks = () => {
  setInterval(async () => {
    await exportBillings()
    console.log('Running every hour')
  }, INTERVAL_TIME)
}

async function retry(request, retryAttempts = 0) {
  let response = null
  try {
    response = await request()
    if (![200, 201, 202].includes(response.status)) {
      console.error('ERROR ', response)
      if (retryAttempts >= MAX_RETRY_ATTEMPTS) return response
      return await retry(request, ++retryAttempts)
    }
    return response
  } catch (error) {
    if (retryAttempts >= MAX_RETRY_ATTEMPTS) return response
    return await retry(request, ++retryAttempts)
  }
}
