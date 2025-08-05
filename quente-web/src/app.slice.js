import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarShow: false,
  sidebarUnfoldable: false,
  showHeader: true,
  showToast: false,
  toastConfig: {
    message: '',
    color: 'info',
  },
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSidebarShow: (state, action) => {
      state.sidebarShow = action.payload
    },
    setShowHeader: (state, action) => {
      state.showHeader = action.payload
    },
    setSidebarUnfoldable: (state, action) => {
      state.sidebarUnfoldable = action.payload
    },
    setShowToast: (state, action) => {
      state.showToast = action.payload
    },
    setToastConfig: (state, action) => {
      state.toastConfig = action.payload
    },
  },
})

export const { setSidebarShow, setSidebarUnfoldable, setShowToast, setToastConfig, setShowHeader } =
  appSlice.actions

export default appSlice.reducer
