import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  saving: false,
  fetching: false,
  saveSuccess: false,
  itemCategories: [],
  itemCategory: null,
  isCodeRegistered: false,
}

export const itemsSlice = createSlice({
  name: 'item-categories',
  initialState,
  reducers: {
    setSaving: (state, action) => void (state.saving = action.payload),
    setFetching: (state, action) => void (state.fetching = action.payload),
    saveSuccess: (state, action) => void (state.saveSuccess = action.payload),
    setItemCategories: (state, action) => void (state.itemCategories = action.payload),
    setItemCategory: (state, action) => void (state.itemCategory = action.payload),
    setCodeRegistered: (state, action) => void (state.isCodeRegistered = action.payload),
  },
})

export const {
  saveSuccess,
  setItemCategories,
  setItemCategory,
  setCodeRegistered,
  setSaving,
  setFetching,
} = itemsSlice.actions

export default itemsSlice.reducer
