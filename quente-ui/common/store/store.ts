import { configureStore } from '@reduxjs/toolkit';
import organizationReducer from '../modules/admin/slices/organizationSlice';
import { OrganizationService } from '../modules/admin/services/organization.service';
import { ApiService } from '../../web/src/ApiService';
import axios from 'axios';

// We create a wrapper that adapts our ApiService methods to work with the axios interface
// that OrganizationService expects
const axiosAdapter = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize services
const createServices = () => {
  return {
    organizationService: new OrganizationService(axiosAdapter),
  };
};

export const adminStore = configureStore({
  reducer: {
    organizations: organizationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: createServices(),
      },
    }),
});

// Export types
export type AdminRootState = ReturnType<typeof adminStore.getState>;
export type AppDispatch = typeof adminStore.dispatch;
