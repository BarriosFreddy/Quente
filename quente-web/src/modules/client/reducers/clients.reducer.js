import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saveSuccess: false,
  clients: [],
  client: null,
  loading: false,
  fetching: false,
  saving: false,
  existsByDNI: false,
}

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setExistsByDNI: (state, action) => void (state.existsByDNI = action.payload),
    setLoading: (state, action) => void (state.loading = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    setSaving: (state, action) => void (state.saving = action.payload),
    setClients: (state, action) => void (state.clients = action.payload),
    setClient: (state, action) => void (state.client = action.payload),
  },
})

export const {
  saveSuccess,
  setClients,
  setClient,
  setLoading,
  setFetching,
  setSaving,
  setExistsByDNI,
} = clientsSlice.actions

export default clientsSlice.reducer
