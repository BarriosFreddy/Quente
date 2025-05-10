import itemsRepository from "./items.repository";
import {
  saveSuccess,
  setItems,
  setExistsByCode,
  setSaving,
  setFetching,
} from "../reducers/items.reducer";
import db from "@quente/common/shared/services/DatabaseService";

export const saveItem = (item) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    const savedItem = await db.saveItem(item, api)
    dispatch(saveSuccess(!!savedItem));
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
    const updatedItem = await db.saveItem(item, api) 
    dispatch(saveSuccess(!!updatedItem));
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
    const isRegistered = await itemsRepository.existsByCode(code);
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
      const data = await itemsRepository.findByNameOrCode({
        name: queryParams.name,
        code: queryParams.code,
        page: queryParams.page,
      });
      dispatch(setItems(data));
    } catch (error) {
      console.error("Error fetching items:", error);
      dispatch(setItems([]));
    } finally {
      dispatch(setFetching(false));
    }
  };

export const getAllItems = () => async (dispatch, state, api) => {
  try {
    const { data, status } = await api.get(`/items?size=1000`);
    if (status === 200 && data.length > 0) await itemsRepository.saveBulk(data);
  } catch (error) {
    console.error(error);
  }
};
