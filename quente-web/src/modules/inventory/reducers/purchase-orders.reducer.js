import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  purchaseOrders: [],
  loading: false,
  fetching: false,
  saving: false,
}

export const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setPurchaseOrders: (state, action) => void (state.purchaseOrders = action.payload),
  },
})

export const { saveSuccess, setPurchaseOrders, setLoading, setFetching, setSaving } =
  purchaseOrdersSlice.actions

export default purchaseOrdersSlice.reducer
