import isOnline from "is-online";
import {
  setInfoUser,
  setIsLoggedIn,
  setLoading,
  setLoginSuccess,
} from "../reducers/auth.reducer";

export const login = (userAccountLogin) => async (dispatch, _, api) => {
  dispatch(setLoading(true));
  try {
    const { status, data } =
      (await api.post("/auth/authenticate", userAccountLogin)) || {};
    if (status === 200) {
      dispatch(setIsLoggedIn(true));
      dispatch(setInfoUser(data));
      dispatch(setLoginSuccess(true));
      return;
    }
    if (status === 403) {
      dispatch(setIsLoggedIn(false));
      dispatch(setInfoUser(null));
    }
    dispatch(setLoginSuccess(false));
  } catch (error) {
    console.error("Error attempting to login: ", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const logout = () => async (dispatch, _, api) => {
  try {
    const { status } = (await api.get("/auth/logout")) || {};
    if (status === 200) {
      dispatch(setIsLoggedIn(false));
      dispatch(setInfoUser(null));
    }
  } catch (error) {
    console.log("Error attempting to logout: ", error);
  }
};

export const getInfoUser = () => async (dispatch, getState, api) => {
  try {
    const state = getState();
    const isonline = await isOnline();
    const { data, status } = isonline
      ? await api.get("/auth/info-user")
      : { status: 200, data: state.auth.infoUser };
    if (status === 200) {
      dispatch(setIsLoggedIn(!!data));
      dispatch(setInfoUser(data));
    }
  } catch (e) {
    console.error("Error attempting to get Info user: ", e);
  }
};
