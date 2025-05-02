import isOnline from "is-online";
import {
  setInfoUser,
  setIsLoggedIn,
  setLoading,
  setLoginSuccess,
} from "../reducers/auth.reducer";

/**
 * Handles user login by authenticating credentials with the API
 * @param {Object} userAccountLogin - User credentials (email and password)
 */
export const login = (userAccountLogin) => async (dispatch, _, api) => {
  dispatch(setLoading(true));
  try {
    // Encode password in base64 before sending
    const encodedCredentials = {
      ...userAccountLogin,
      password: btoa(userAccountLogin.password),
    };

    const { status, data } =
      (await api.post("/auth/authenticate", encodedCredentials)) || {};
    
    if (status === 200) {
      dispatch(setIsLoggedIn(true));
      dispatch(setInfoUser(data));
      dispatch(setLoginSuccess(true));
      return;
    }
    
    if (status === 401 || status === 403) {
      dispatch(setIsLoggedIn(false));
      dispatch(setInfoUser(null));
      dispatch(setLoginSuccess(false));
      console.error("Authentication failed:", data?.message || "Invalid credentials");
      return;
    }
    
    dispatch(setLoginSuccess(false));
    console.error("Login error:", data?.message || "Unknown error");
  } catch (error) {
    console.error("Error attempting to login: ", error);
    dispatch(setLoginSuccess(false));
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Logs out the current user by clearing cookies and local state
 */
export const logout = () => async (dispatch, _, api) => {
  try {
    const { status, data } = (await api.get("/auth/logout")) || {};
    
    if (status === 200) {
      dispatch(setIsLoggedIn(false));
      dispatch(setInfoUser(null));
    } else {
      console.error("Logout failed:", data?.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error attempting to logout: ", error);
    // Force logout on client side even if server request fails
    dispatch(setIsLoggedIn(false));
    dispatch(setInfoUser(null));
  }
};

/**
 * Refreshes the access token using the refresh token
 * This is automatically handled by the API service interceptor
 * but can be called manually if needed
 */
export const refreshToken = () => async (_, __, api) => {
  try {
    const { status, data } = await api.post("/auth/refresh-token");
    return { success: status === 200, data };
  } catch (error) {
    console.error("Token refresh failed: ", error);
    return { success: false, error };
  }
};

/**
 * Gets the current user information from the API
 * Falls back to cached user data when offline
 */
export const getInfoUser = () => async (dispatch, getState, api) => {
  try {
    const state = getState();
    const isOnlineStatus = await isOnline();
    
    // Use cached data when offline
    if (!isOnlineStatus && state.auth.infoUser) {
      dispatch(setIsLoggedIn(true));
      dispatch(setInfoUser(state.auth.infoUser));
      return;
    }
    
    const { data, status } = await api.get("/auth/info-user");
    
    if (status === 200 && data) {
      dispatch(setIsLoggedIn(true));
      dispatch(setInfoUser(data));
    } else if (status === 401 || status === 403) {
      // Token is invalid or expired and refresh token failed
      dispatch(setIsLoggedIn(false));
      dispatch(setInfoUser(null));
    }
  } catch (error) {
    console.error("Error attempting to get user info: ", error);
    // Don't clear user state on network errors to allow offline functionality
  }
};
