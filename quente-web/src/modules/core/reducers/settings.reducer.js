import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: 'light',
  },
  reducers: {
    setTheme(state, { payload }) {
      state.theme = payload
    },
  },
})

export const { setTheme } = settingsSlice.actions
export default settingsSlice.reducer
