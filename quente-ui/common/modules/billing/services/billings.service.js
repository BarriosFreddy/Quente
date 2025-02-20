import billingsRepository from "./billings.repository";
import {
  setSaveSuccess,
  setBillings,
  saveBillingLocally,
  setSaving,
  setFetching,
  setBillingsGraph,
  setBillingTopSales,
} from "../reducers/billings.reducer";

export const saveBilling = (billing) => async (dispatch, getState, api) => {
  dispatch(setSaving(true));
  try {
    await billingsRepository.save(billing);
    dispatch(setSaveSuccess(true));
  } catch (error) {
    console.error("Error saving billing:", error);
    dispatch(setSaveSuccess(false));
  } finally {
    dispatch(setSaving(false));
  }
};

export const saveBillingBulk =
  (billings) => async (dispatch, getState, api) => {
    dispatch(setSaving(true));
    try {
      const { status } = await api.post("/billings/bulk", billings);
      dispatch(setSaveSuccess(status === 201));
    } catch (error) {
      console.error("Error saving billing bulk:", error);
      dispatch(setSaveSuccess(false));
    } finally {
      dispatch(setSaving(false));
    }
  };

export const getBillings =
  ({ page = 1 } = {}) =>
  async (dispatch, getState, api) => {
    dispatch(setFetching(true));
    try {
      const data = await billingsRepository.find({ page });
      console.log({ data });
      if (data) dispatch(setBillings(data));
    } catch (error) {
      console.error("Error fetching billings:", error);
    } finally {
      dispatch(setFetching(false));
    }
  };

export const getBillingsGTDate = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true));
  try {
    //const { data, status } = await api.get(`/billings/per/${date}`);
    const data = await billingsRepository.findGreaterThanDate(date);
    if (data) dispatch(setBillingsGraph(data));
  } catch (error) {
    console.error("Error fetching billings greater than date:", error);
  } finally {
    dispatch(setFetching(false));
  }
};

export const getBillingTopSales = (date) => async (dispatch, _, api) => {
  dispatch(setFetching(true));
  try {
    //const { data, status } = await api.get(`/billings/stats/top-sales/${date}`)
    const data = await billingsRepository.findTopSalesItems(date);
    if (data) dispatch(setBillingTopSales(data));
  } catch (error) {
    console.error("Error fetching billing top sales:", error);
  } finally {
    dispatch(setFetching(false));
  }
};

function saveLocally(dispatch, state, billing) {
  const { billings } = state.billing.offline;
  let billingsArray = [];
  if (Array.isArray(billings)) {
    const arr = JSON.parse(JSON.stringify(billings));
    billingsArray = [...billingsArray, ...arr];
  }
  billingsArray.unshift(billing);
  dispatch(saveBillingLocally(billingsArray));
  return { status: 201 };
}

function getLocally(dispatch, state) {
  const billings = [state.billing.offline.billings];
  if (billings.length > 10) billings.length = 10;
  dispatch(setBillings(billings));
  return { data: billings, status: 200 };
}
