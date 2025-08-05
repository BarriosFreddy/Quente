import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  loading: false,
  fetching: false,
  saving: false,
  billings: [],
  billingsGraph: [],
  billingTopSales: [],
  billing: null,
  offline: {
    billings: [],
  },
}

export const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setSaveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setBillings: (state, action) => void (state.billings = action.payload),
    setBillingsGraph: (state, action) => void (state.billingsGraph = action.payload),
    saveBillingLocally: (state, action) => void (state.offline.billings = action.payload),
    setBilling: (state, action) => void (state.billing = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setBillingTopSales: (state, action) => void (state.billingTopSales = action.payload),
  },
})

export const {
  setSaveSuccess,
  setBillings,
  setBilling,
  saveBillingLocally,
  setLoading,
  setBillingsGraph,
  setSaving,
  setFetching,
  setBillingTopSales,
} = billingSlice.actions

export default billingSlice.reducer
