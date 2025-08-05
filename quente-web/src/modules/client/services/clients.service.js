import {
  saveSuccess,
  setClients,
  setSaving,
  setFetching,
  setExistsByDNI,
  setClient,
} from "../reducers/clients.reducer";
import isOnline from "is-online";
let isonline = false;

export const saveClient = (client) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    const { status } = await api.post("/clients", client);
    dispatch(saveSuccess(status === 201));
  } catch (error) {
    console.error("Error saving client:", error);
  } finally {
    dispatch(setSaving(false));
  }
};

export const updateClient = (client) => async (dispatch, _, api) => {
  try {
    dispatch(setSaving(true));
    const clientToUpdate = { ...client };
    const id = clientToUpdate._id;
    delete clientToUpdate._id;
    const { status } = await api.put(`/clients/${id}`, clientToUpdate);
    dispatch(saveSuccess(status === 201));
  } catch (error) {
    console.error("Error updating client:", error);
  } finally {
    dispatch(setSaving(false));
  }
};

export const getClients =
  (queryParams, useCacheOnly = false) =>
  async (dispatch, getState, api) => {
    try {
      dispatch(setFetching(true));
      const urlQueryParams = new URLSearchParams(queryParams).toString();
      isonline = useCacheOnly ? false : await isOnline();
      const { data, status } = isonline
        ? await api.get(
            `/clients${
              urlQueryParams.length > 0 ? "?" + urlQueryParams.toString() : ""
            }`
          )
        : getLocally(getState(), queryParams);
      if (status === 200) dispatch(setClients(data));
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      dispatch(setFetching(false));
    }
  };

export const existByDNI = (dni) => async (dispatch, _, api) => {
  try {
    if (!dni) return;
    const { data, status } = await api.get(`/clients/dni/exists/${dni}`);
    if (status === 200) dispatch(setExistsByDNI(data));
  } catch (error) {
    console.error("Error checking existence by DNI:", error);
  }
};

export const getClientByDNI = (dni) => async (dispatch, _, api) => {
  try {
    if (!dni) return;
    const { data, status } = await api.get(`/clients/dni/${dni}`);
    if (status === 200) dispatch(setClient(data));
  } catch (error) {
    console.error("Error fetching client by DNI:", error);
  }
};

function getLocally(state, queryParams) {
  const { clients } = state.clients.offline;
  let data = clients.filter(
    ({ code, name }) =>
      code.toUpperCase().includes(queryParams.code.toUpperCase()) ||
      name.toUpperCase().includes(queryParams.name.toUpperCase())
  );
  if (data.length > 10) data.length = 10;
  return { data, status: 200 };
}
