import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  kardexes: [],
  loading: false,
  fetching: false,
  saving: false,
}

export const kardexesSlice = createSlice({
  name: 'kardexes',
  initialState,
  reducers: {
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setKardexes: (state, action) => void (state.items = action.payload),
  },
})

export const { saveSuccess, setKardexes, setLoading, setFetching, setSaving } =
  kardexesSlice.actions

export default kardexesSlice.reducer
