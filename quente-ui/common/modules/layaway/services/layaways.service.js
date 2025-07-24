import {
  setSaving,
  setFetching,
  saveSuccess,
  setLayaways,
  setLayaway,
  setPayments,
  setAddPaymentSuccess,
  setUpdateStatusSuccess,
  setPagination,
} from '../reducers/layaway.reducer'

/**
 * Create a new layaway
 * @param {Object} layaway - The layaway data to save
 * @returns {Function} Thunk function
 */
export const saveLayaway = (layaway) => async (dispatch, _, api) => {
  dispatch(setSaving(true))
  try {
    const { status, data } = await api.post('/layaways', layaway)
    if (status === 201) {
      dispatch(saveSuccess(true))
      dispatch(setLayaway(data))
      return data
    } else {
      dispatch(saveSuccess(false))
      return null
    }
  } catch (error) {
    console.error('Error saving layaway:', error)
    dispatch(saveSuccess(false))
    return null
  } finally {
    dispatch(setSaving(false))
  }
}

/**
 * Get layaways with pagination and optional filters
 * @param {Object} params - Query parameters including pagination and filters
 * @returns {Function} Thunk function
 */
export const getLayaways = (params = {}) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  try {
    // Create a properly structured params object for the API
    let apiUrl = '/layaways';
    let queryString = '';
    
    // Make a copy of the params to avoid mutating the original
    const apiParams = { ...params };
    
    // Convert the params object to a query string
    // We need to handle this manually because the backend expects a specific structure
    if (Object.keys(apiParams).length > 0) {
      const queryParts = [];
      
      // Handle special case for dateRange to match backend expectations
      if (apiParams.dateRange) {
        if (apiParams.dateRange.fromDate) {
          queryParts.push(`filters[dateRange][fromDate]=${encodeURIComponent(apiParams.dateRange.fromDate)}`);
        }
        if (apiParams.dateRange.toDate) {
          queryParts.push(`filters[dateRange][toDate]=${encodeURIComponent(apiParams.dateRange.toDate)}`);
        }
        // Remove dateRange from params to avoid double processing
        delete apiParams.dateRange;
      }
      
      // Handle all other params
      Object.entries(apiParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'status') {
            // Special case for status filter
            queryParts.push(`filters[status]=${encodeURIComponent(value)}`);
          } else {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        }
      });
      
      if (queryParts.length > 0) {
        queryString = '?' + queryParts.join('&');
      }
    }
    
    // Update the API URL with the query string
    apiUrl += queryString;
    
    const { data, status } = await api.get(apiUrl)
    if (status === 200) {
      dispatch(setLayaways(data?.data))
      dispatch(setPagination(data.pagination))
    }
    return data
  } catch (error) {
    console.error('Error fetching layaways:', error)
    return null
  } finally {
    dispatch(setFetching(false))
  }
}

/**
 * Get a single layaway by ID
 * @param {string} id - Layaway ID
 * @returns {Function} Thunk function
 */
export const getLayawayById = (id) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  try {
    const { data, status } = await api.get(`/layaways/${id}`)
    if (status === 200) {
      dispatch(setLayaway(data))
      return data
    }
    return null
  } catch (error) {
    console.error('Error fetching layaway:', error)
    return null
  } finally {
    dispatch(setFetching(false))
  }
}

/**
 * Add payment to a layaway
 * @param {string} id - Layaway ID
 * @param {Object} payment - Payment data
 * @returns {Function} Thunk function
 */
export const addPayment = (id, payment) => async (dispatch, _, api) => {
  dispatch(setSaving(true))
  try {
    const { data, status } = await api.post(`/layaways/${id}/payments`, payment)
    dispatch(setAddPaymentSuccess(status === 200))
    if (status === 200) {
      dispatch(setLayaway(data))
      // Fetch updated payments after adding a new one
      dispatch(getLayawayPayments(id))
      return data
    }
    return null
  } catch (error) {
    console.error('Error adding payment:', error)
    dispatch(setAddPaymentSuccess(false))
    return null
  } finally {
    dispatch(setSaving(false))
  }
}

/**
 * Get all payments for a layaway
 * @param {string} id - Layaway ID
 * @returns {Function} Thunk function
 */
export const getLayawayPayments = (id) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  try {
    const { data, status } = await api.get(`/layaways/${id}/payments`)
    if (status === 200) {
      dispatch(setPayments(data))
      return data
    }
    return []
  } catch (error) {
    console.error('Error fetching layaway payments:', error)
    return []
  } finally {
    dispatch(setFetching(false))
  }
}

/**
 * Update layaway status (ACTIVE, DELIVERED, CANCELED)
 * @param {string} id - Layaway ID
 * @param {Object} statusUpdate - Status update data including status and optional reason
 * @returns {Function} Thunk function
 */
export const updateLayawayStatus = (id, statusUpdate) => async (dispatch, _, api) => {
  dispatch(setSaving(true))
  try {
    const { data, status } = await api.patch(`/layaways/${id}/status`, statusUpdate)
    dispatch(setUpdateStatusSuccess(status === 200))
    if (status === 200) {
      dispatch(setLayaway(data))
      return data
    }
    return null
  } catch (error) {
    console.error('Error updating layaway status:', error)
    dispatch(setUpdateStatusSuccess(false))
    return null
  } finally {
    dispatch(setSaving(false))
  }
}
