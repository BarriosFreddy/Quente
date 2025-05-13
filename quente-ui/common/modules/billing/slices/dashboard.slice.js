import { createSlice } from '@reduxjs/toolkit'
import { getDashboardStats } from '../services/dashboard.service'

const initialState = {
  loading: false,
  error: null,
  stats: {
    totalRevenue: 0,
    totalItems: 0,
    currentStock: 0,
    numberOfBillings: 0,
    billingsByDay: [],
    topSellingProducts: [],
    stockByCategory: [],
    lowStockItems: []
  }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch dashboard statistics'
      })
  }
})

export const { resetDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
