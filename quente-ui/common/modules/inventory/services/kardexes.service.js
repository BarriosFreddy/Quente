import { saveSuccess, setSaving } from "../reducers/kardexes.reducer";

export const saveAllKardexes = (item) => async (dispatch, _, api) => {
  dispatch(setSaving(true));
  try {
    const { status } = await api.post("/kardex/bulk", item);
    dispatch(saveSuccess(status === 201));
  } catch (e) {
    dispatch(saveSuccess(false));
    console.error("Error saving all kardex:", error);
  } finally {
    dispatch(setSaving(false));
  }
};
