/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/Services.md)
 * documentation for more details.
 */
import {ApiResponse, ApisauceInstance, HEADERS, create} from 'apisauce';
import axios from 'axios';
import Config from '../../config';
import {GeneralApiProblem, getGeneralApiProblem} from './apiProblem';
import type {ApiConfig, ApiFeedResponse} from './api.types';
import type {EpisodeSnapshotIn} from '../../models/Episode';
import * as storage from '../../utils/storage';
import {AUTH_TOKEN, REFRESH_TOKEN} from '../../utils/constants';

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 30000,
};

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance;
  config: ApiConfig;
  isRefreshing: boolean = false;
  refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config;
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      withCredentials: true,
      headers: {
        Accept: 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.apisauce.axiosInstance.interceptors.request.use(
      async config => {
        if (config.headers.Authorization?.toString().startsWith('Basic'))
          return config;
        config.headers.Authorization = `Bearer ${
          (await storage.load(AUTH_TOKEN)) ?? ''
        }`;
        return config;
      },
      e => Promise.reject(e),
    );

    // Response interceptor to handle token refresh
    this.apisauce.axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, wait for the new token
            return new Promise(resolve => {
              this.addRefreshSubscriber(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axios(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh the token
            const refreshToken = await storage.load(REFRESH_TOKEN);
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(
              `${this.config.url}/api/v1/auth/refresh-token`,
              {},
              {
                withCredentials: true,
              },
            );

            if (response.status === 200) {
              // Extract tokens from cookies (they are set by the server)
              // We're just notifying subscribers here
              this.onRefreshed('token-refreshed');
              this.isRefreshing = false;
              
              // Retry the original request
              originalRequest.headers.Authorization = `Bearer token-refreshed`;
              return axios(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            
            // Clear tokens on refresh failure
            await storage.remove(AUTH_TOKEN);
            await storage.remove(REFRESH_TOKEN);
            
            // Redirect to login or handle authentication failure
            // This would typically be handled by your navigation/auth state
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Add a subscriber to be notified when token is refreshed
   */
  addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers that token has been refreshed
   */
  onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  setHeaders(headers: HEADERS) {
    this.apisauce.setHeaders(headers);
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<
    {kind: 'ok'; episodes: EpisodeSnapshotIn[]} | GeneralApiProblem
  > {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx`,
    );

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response);
      if (problem) return problem;
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data;

      // This is where we transform the data into the shape we expect for our MST model.
      const episodes: EpisodeSnapshotIn[] =
        rawData?.items.map(raw => ({
          ...raw,
        })) ?? [];

      return {kind: 'ok', episodes};
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack);
      }
      return {kind: 'bad-data'};
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api();
