import {
  saveSuccess,
  setFetching,
  setInvEnumeration,
  setInvEnumerations,
  setSaving,
} from '../reducers/inv-enumerations.reducer'

export const saveInvEnumeration = (item) => async (dispatch, _, api) => {
  dispatch(setSaving(true))
  try {
    const { status } = await api.post('/inv-enumerations', item)
    dispatch(saveSuccess(status === 201))
  } catch (error) {
    console.error('Error saving inventory enumeration:', error)
    dispatch(saveSuccess(false))
  }
  dispatch(setSaving(false))
}

export const updateInvEnumeration = (item) => async (dispatch, _, api) => {
  dispatch(setSaving(true))
  try {
    const invEnumerationToUpdate = { ...item }
    const id = invEnumerationToUpdate._id
    delete invEnumerationToUpdate._id
    const { status } = await api.put(`/inv-enumerations/${id}`, invEnumerationToUpdate)
    dispatch(saveSuccess(status === 201))
  } catch (error) {
    console.error('Error updating inventory enumeration:', error)
    dispatch(saveSuccess(false))
  }
  dispatch(setSaving(false))
}

export const getInvEnumerations = (item) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  try {
    const { status, data } = await api.get('/inv-enumerations?page=1', item)
    if (status === 200) {
      dispatch(setInvEnumerations(data))
    }
  } catch (error) {
    console.error('Error fetching inventory enumerations:', error)
  }
  dispatch(setFetching(false))
}

export const getInvEnumerationByCode = (code) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  try {
    const { status, data } = await api.get(`/inv-enumerations/code/${code}`)
    if (status === 200) {
      dispatch(setInvEnumeration(data))
    }
  } catch (error) {
    console.error('Error fetching inventory enumeration by code:', error)
  }
  dispatch(setFetching(false))
}
