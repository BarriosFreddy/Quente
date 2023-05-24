import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  loading: false,
  billings: [],
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
    saveBillingLocally: (state, action) => void (state.offline.billings = action.payload),
    setBilling: (state, action) => void (state.billing = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
  },
})

export const { setSaveSuccess, setBillings, setBilling, saveBillingLocally, setLoading } =
  billingSlice.actions

export default billingSlice.reducer
