import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  addPaymentSuccess: false,
  updateStatusSuccess: false,
  layaways: [],
  layaway: null,
  payments: [],
  loading: false,
  fetching: false,
  saving: false,
  existsById: false,
  pagination: {
    totalDocs: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  }
}

export const layawaySlice = createSlice({
  name: 'layaways',
  initialState,
  reducers: {
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setAddPaymentSuccess: (state, action) => void (state.addPaymentSuccess = action.payload),
    setUpdateStatusSuccess: (state, action) => void (state.updateStatusSuccess = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setLayaways: (state, action) => void (state.layaways = action.payload),
    setLayaway: (state, action) => void (state.layaway = action.payload),
    setPayments: (state, action) => void (state.payments = action.payload),
    setExistsById: (state, action) => void (state.existsById = action.payload),
    setPagination: (state, action) => void (state.pagination = action.payload),
  },
})

export const {
  saveSuccess,
  setAddPaymentSuccess,
  setUpdateStatusSuccess,
  setLoading,
  setFetching,
  setSaving,
  setLayaways,
  setLayaway,
  setPayments,
  setExistsById,
  setPagination
} = layawaySlice.actions

export default layawaySlice.reducer
