import itemsRepository from "./items.repository";
import {
  saveSuccess,
  setItems,
  setExistsByCode,
  setSaving,
  setFetching,
} from "../reducers/items.reducer";
import db from "@/shared/services/DatabaseService";

export const saveItem = (item) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    //const savedItem = await db.saveItem(item, api);
    const { status } = await api.post('/items', item);
    dispatch(saveSuccess(status === 201))
  } catch (error) {
    console.error("Error saving item:", error);
    dispatch(saveSuccess(false));
  } finally {
    dispatch(setSaving(false));
  }
};

export const updateItem = (item) => async (dispatch, _, api) => {
  dispatch(setSaving(true));
  try {
    const itemToUpdate = { ...item }
    const id = itemToUpdate._id
    delete itemToUpdate._id
    //const updatedItem = await db.saveItem(item, api);
    const { status } = await api.put(`/items/${id}`, itemToUpdate)
    dispatch(saveSuccess(status === 201));
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
    const { data } = await api.get(`/items/code/${code}`)
    //const isRegistered = await itemsRepository.existsByCode(code);
    dispatch(setExistsByCode(!!data));
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
      let items = [];
      if (useCacheOnly) {
        items = await itemsRepository.findByNameOrCode({
          name: queryParams.name,
          code: queryParams.code,
          page: queryParams.page,
        });
      } else {
        const params = new URLSearchParams(queryParams).toString();
        const { data } = await api.get(`/items?${params}`)
        items = data
      }
      dispatch(setItems(items));
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

/**
 * Removes stock from an item locally by updating the expirationControl array
 * Uses the same logic as the backend removeStock method
 * @param {string} itemId - The ID of the item to update
 * @param {number} units - The number of units to remove
 * @returns {function} - Thunk function
 */
export const removeStock = (itemId, units) => async (dispatch, getState) => {
  try {
    // Find the item to update
    let itemToUpdate = await db.items.get(itemId);

    if (!itemToUpdate) {
      console.error("Item not found in IndexDB for stock removal, ID:", itemId);
      return null;
    }

    // Create a deep copy of the item to modify
    const updatedItem = JSON.parse(JSON.stringify(itemToUpdate));

    // Apply the same logic as the backend removeStock method
    let unitsToRemove = +units;

    // Make sure expirationControl is defined
    if (
      !updatedItem.expirationControl ||
      !Array.isArray(updatedItem.expirationControl)
    ) {
      updatedItem.expirationControl = [];
      console.warn("expirationControl was not defined or not an array");
      return null;
    }

    for (let index = 0; index < updatedItem.expirationControl.length; index++) {
      const expControl = updatedItem.expirationControl[index];
      const lotUnits = +expControl.lotUnits;

      if (lotUnits > unitsToRemove) {
        updatedItem.expirationControl[index].lotUnits =
          lotUnits - unitsToRemove;
        break;
      } else if (lotUnits === unitsToRemove) {
        updatedItem.expirationControl[index].lotUnits = 0;
        break;
      } else if (lotUnits < unitsToRemove) {
        unitsToRemove = unitsToRemove - lotUnits;
        updatedItem.expirationControl[index].lotUnits = 0;
      }
    }

    // Update the item in IndexDB
    await itemsRepository.update(itemId, updatedItem);

    return updatedItem;
  } catch (error) {
    console.error("Error removing stock locally:", error);
    return null;
  }
};
