import billingsRepository from "./billings.repository";
import {
  setSaveSuccess,
  setBillings,
  saveBillingLocally,
  setSaving,
  setFetching,
  setBillingsGraph,
  setBillingTopSales,
} from "../reducers/billings.reducer";
import isOnline from "is-online";
import db from "../../../shared/services/DatabaseService";
import { removeStock } from "../../inventory/services/items.service";

export const saveBilling = (billing) => async (dispatch, getState, api) => {
  try {
    dispatch(setSaving(true));
    const savedBilling = await db.saveBilling(billing, api);
    
    // If billing was saved successfully, update inventory by removing stock
    if (savedBilling) {
      // Process each item in the billing to remove stock
      if (billing.items && Array.isArray(billing.items)) {
        for (const item of billing.items) {
          if (item._id && item.units) {
            // Apply the removeStock logic to update local IndexDB
            try {
              await dispatch(removeStock(item._id, item.units));
            } catch (err) {
              console.error(`Failed to update stock for item ${item.name || item.code}:`, err);
            }
          }
        }
      }
    }
    
    dispatch(setSaveSuccess(!!savedBilling));
  } catch (error) {
    console.error("Error saving billing:", error);
    dispatch(setSaveSuccess(false));
  } finally {
    dispatch(setSaving(false));
  }
};

export const saveBillingBulk =
  (billings) => async (dispatch, getState, api) => {
    dispatch(setSaving(true));
    try {
      const isonline = await isOnline();
      if (isonline) {
        const { status } = await api.post("/billings/bulk", billings);
        dispatch(setSaveSuccess(status === 201));
      }
      await billingsRepository.saveBulk(billings);
      if (!isonline) dispatch(setSaveSuccess(true));
    } catch (error) {
      console.error("Error saving billing bulk:", error);
      dispatch(setSaveSuccess(false));
    } finally {
      dispatch(setSaving(false));
    }
  };

// Cache for billing results to improve navigation performance
let billingsCache = new Map();

/**
 * Generate a cache key based on filter parameters
 * @param {object} params - Filter parameters
 * @returns {string} Cache key
 */
const generateCacheKey = (params) => {
  return JSON.stringify(params);
};

/**
 * Clear the billings cache
 */
export const clearBillingsCache = () => {
  billingsCache.clear();
};

/**
 * Get billings with filter support and caching
 */
export const getBillings =
  ({ 
    page = 1, 
    fromDate = null, 
    toDate = null, 
    status = null, 
    code = null,
    useCache = true
  } = {}) =>
  async (dispatch, getState, api) => {
    dispatch(setFetching(true));
    
    try {
      // Build filter parameters object
      const params = { page };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (status) params.status = status;
      if (code) params.code = code;
      
      // Generate cache key based on parameters
      const cacheKey = generateCacheKey(params);
      
      const isonline = await isOnline();
      
      if (isonline) {
        // Check cache first if useCache is true
        if (useCache && billingsCache.has(cacheKey)) {
          dispatch(setBillings(billingsCache.get(cacheKey)));
          dispatch(setFetching(false));
          return;
        }
        
        // Convert to URL query params
        const queryParams = new URLSearchParams(params).toString();
        
        const { data, status } = await api.get(`/billings?${queryParams}`);
        if (status === 200) {
          // Ensure data is always an array before dispatching
          const billingsArray = Array.isArray(data) ? data : [];
          dispatch(setBillings(billingsArray));
          
          // Store in cache
          if (useCache) {
            billingsCache.set(cacheKey, data);
            
            // Limit cache size to prevent memory issues
            if (billingsCache.size > 20) {
              const oldestKey = billingsCache.keys().next().value;
              billingsCache.delete(oldestKey);
            }
          }
        }
      } else {
        // Offline mode with filter support
        const localData = await billingsRepository.findWithFilters({
          page,
          fromDate,
          toDate, 
          status,
          code
        });
        if (localData) dispatch(setBillings(localData));
      }
    } catch (error) {
      console.error("Error fetching billings:", error);
    } finally {
      dispatch(setFetching(false));
    }
  };

export const getBillingsGTDate = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true));
  try {
    const isonline = await isOnline();
    if (isonline) {
      const { data, status } = await api.get(`/billings/per/${date}`);
      if (status === 200) dispatch(setBillingsGraph(data));
    } else {
      const localData = await billingsRepository.findGreaterThanDate(date);
      if (localData) dispatch(setBillingsGraph(localData));
    }
  } catch (error) {
    console.error("Error fetching billings greater than date:", error);
  } finally {
    dispatch(setFetching(false));
  }
};

export const getBillingTopSales = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true));
  try {
    const isonline = await isOnline();
    if (isonline) {
      const { data, status } = await api.get(`/billings/stats/top-sales/${date}`);
      if (status === 200) dispatch(setBillingTopSales(data));
    } else {
      const localData = await billingsRepository.findTopSalesItems(date);
      if (localData) dispatch(setBillingTopSales(localData));
    }
  } catch (error) {
    console.error("Error fetching billing top sales:", error);
  } finally {
    dispatch(setFetching(false));
  }
};

function saveLocally(dispatch, state, billing) {
  const { billings } = state.billing.offline;
  let billingsArray = [];
  if (Array.isArray(billings)) {
    const arr = JSON.parse(JSON.stringify(billings));
    billingsArray = [...billingsArray, ...arr];
  }
  billingsArray.unshift(billing);
  dispatch(saveBillingLocally(billingsArray));
  return { status: 201 };
}

function getLocally(dispatch, state) {
  const billings = [state.billing.offline.billings];
  if (billings.length > 10) billings.length = 10;
  dispatch(setBillings(billings));
  return { data: billings, status: 200 };
}

/**
 * Update the status of a billing
 * @param {string} id - The ID of the billing to update
 * @param {string} status - The new status (APPROVED or CANCELED)
 * @returns {Function} - Redux thunk action
 */
export const updateBillingStatus = (id, status) => async (dispatch, getState, api) => {
  dispatch(setSaving(true));
  try {
    const isonline = await isOnline();
    if (isonline) {
      const { data, status: responseStatus } = await api.patch(`/billings/${id}/status`, { status });
      
      if (responseStatus === 200) {
        // Update the billing in the Redux store
        const currentBillings = getState().billing.billings;
        const updatedBillings = currentBillings.map(billing => 
          billing._id === id ? { ...billing, status } : billing
        );
        
        dispatch(setBillings(updatedBillings));
        dispatch(setSaveSuccess(!!data._id));
        return data;
      }
    } else {
      // Offline mode: Update local billings
      const currentBillings = getState().billing.billings;
      const updatedBillings = currentBillings.map(billing => 
        billing._id === id ? { ...billing, status } : billing
      );
      
      dispatch(setBillings(updatedBillings));
      dispatch(setSaveSuccess(true));
    }
  } catch (error) {
    console.error("Error updating billing status:", error);
    dispatch(setSaveSuccess(false));
    return null;
  } finally {
    dispatch(setSaving(false));
  }
};
