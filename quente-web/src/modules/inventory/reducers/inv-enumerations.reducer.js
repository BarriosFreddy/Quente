import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  invEnumerations: [],
  invEnumeration: null,
  loading: false,
  fetching: false,
  saving: false,
}

export const invEnumerationsSlice = createSlice({
  name: 'invEnumerations',
  initialState,
  reducers: {
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setInvEnumerations: (state, action) => void (state.invEnumerations = action.payload),
    setInvEnumeration: (state, action) => void (state.invEnumeration = action.payload),
  },
})

export const {
  saveSuccess,
  setInvEnumerations,
  setInvEnumeration,
  setLoading,
  setFetching,
  setSaving,
} = invEnumerationsSlice.actions

export default invEnumerationsSlice.reducer
