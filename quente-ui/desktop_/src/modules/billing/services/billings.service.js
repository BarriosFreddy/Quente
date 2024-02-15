import {
  setSaveSuccess,
  setBillings,
  saveBillingLocally,
  setSaving,
  setFetching,
  setBillingsGraph,
  setBillingTopSales,
  setBilling
} from '../reducers/billings.reducer'

export const saveBilling = (billing) => async (dispatch, getState, api) => {
  dispatch(setSaving(true))
  const { data, status } = await api.post('/billings', billing)
  dispatch(setSaveSuccess(status === 201))
  !!data && dispatch(setBilling(data))
  dispatch(setSaving(false))
}

export const saveBillingBulk = (billings) => async (dispatch, getState, api) => {
  dispatch(setSaving(true))
  const { status } = await api.post('/billings/bulk', billings)
  dispatch(setSaveSuccess(status === 201))
  dispatch(setSaving(false))
}

export const getBillings =
  ({ page = 1 } = {}) =>
  async (dispatch, getState, api) => {
    dispatch(setFetching(true))
    const { data, status } = await api.get(`/billings?page=${page}`)
    if (status === 200) dispatch(setBillings(data))
    dispatch(setFetching(false))
  }

export const getBillingsGTDate = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  const { data, status } = await api.get(`/billings/per/${date}`)
  if (status === 200) dispatch(setBillingsGraph(data))
  dispatch(setFetching(false))
}

export const getBillingTopSales = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true))
  const { data, status } = await api.get(`/billings/stats/top-sales/${date}`)
  if (status === 200) dispatch(setBillingTopSales(data))
  dispatch(setFetching(false))
}

function saveLocally(dispatch, state, billing) {
  const { billings } = state.billing.offline
  let billingsArray = []
  if (Array.isArray(billings)) {
    const arr = JSON.parse(JSON.stringify(billings))
    billingsArray = [...billingsArray, ...arr]
  }
  billingsArray.unshift(billing)
  dispatch(saveBillingLocally(billingsArray))
  return { status: 201 }
}

function getLocally(dispatch, state) {
  const billings = [state.billing.offline.billings]
  if (billings.length > 10) billings.length = 10
  dispatch(setBillings(billings))
  return { data: billings, status: 200 }
}
