import { quenteDB } from "../../../shared/db/indexDB";
import indexDBService from "../../../shared/services/indexDB.service";
import { hexoid } from "hexoid";
import {
  saveSuccess,
  setItems,
  setItemsLocally,
  setExistsByCode,
  setSaving,
  setFetching,
} from "../reducers/items.reducer";
const OBJECT_ID_LENGTH = 24;

export const saveItem = (item) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    const _id = hexoid(OBJECT_ID_LENGTH)();
    item._id = _id;
    await api.post('/items', item);
    const id = await quenteDB.items.add(item);
    console.log({ id });
    dispatch(saveSuccess(!!id));
  } catch (error) {
    console.error("Error saving item:", error);
    dispatch(saveSuccess(false));
  } finally {
    dispatch(setSaving(false));
  }
};

export const updateItem = (item) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    const itemToUpdate = { ...item };
    const id = itemToUpdate._id;
    delete itemToUpdate._id;
    await api.put(`/items/${id}`, itemToUpdate);
    const wasUpdated = await quenteDB.items.update(id, itemToUpdate);
    dispatch(saveSuccess(wasUpdated));
  } catch (error) {
    console.error("Error updating item:", error);
    dispatch(saveSuccess(false));
  } finally {
    dispatch(setSaving(false));
  }
};

export const saveItemCategoriesBulk = (items) => async (dispatch, _, api) => {
  try {
    const { status } = await api.post("/items/bulk", items);
    dispatch(saveSuccess(status === 201));
  } catch (error) {
    console.error("Error saving item categories in bulk:", error);
    dispatch(saveSuccess(false));
  }
};

export const existByCode = (code) => async (dispatch, _, api) => {
  try {
    if (!code) return;
    //const { data, status } = await api.get(`/items/code/${code}`)
    const isRegistered = await quenteDB.items.where("code").equals(code).first();
    dispatch(setExistsByCode(!!isRegistered));
  } catch (error) {
    console.error("Error checking existence by code:", error);
    dispatch(setExistsByCode(false));
  }
};

export const getItems =
  (queryParams, useCacheOnly = false) =>
  async (dispatch, getState, api) => {
    try {
      dispatch(setFetching(true));
      /*     const urlQueryParams = new URLSearchParams(queryParams).toString()
      isonline = useCacheOnly ? false : await isOnline()
      const { data, status } = isonline
        ? await api.get(`/items${urlQueryParams.length > 0 ? '?' + urlQueryParams.toString() : ''}`)
        : getLocally(getState(), queryParams) */
      const status = 200;
      const data = await quenteDB.items
        .where("name")
        .startsWithIgnoreCase(queryParams.name || "")
        .or("code")
        .equals(queryParams.code || "")
        .offset(((queryParams.page || 1) - 1) * 10)
        .limit(10)
        .toArray();
      dispatch(setItems(data));
    } catch (error) {
      console.error("Error fetching items:", error);
      dispatch(setItems([]));
    } finally {
      dispatch(setFetching(false));
    }
  };


function getLocally(state, queryParams) {
  const { items } = state.items.offline;
  let data = items.filter(
    ({ code, name }) =>
      code.toUpperCase().includes(queryParams.code.toUpperCase()) ||
      name.toUpperCase().includes(queryParams.name.toUpperCase())
  );
  if (data.length > 10) data.length = 10;
  return { data, status: 200 };
}
