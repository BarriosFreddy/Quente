import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  infoUser: null,
  loginSuccess: true,
  loading: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setInfoUser: (state, action) => {
      state.infoUser = action.payload
    },
    setLoginSuccess: (state, action) => {
      state.loginSuccess = action.payload
    },
  },
})

export const { setIsLoggedIn, setInfoUser, setLoginSuccess, setLoading } = authSlice.actions

export default authSlice.reducer
