import axios from "axios";

export const setupAxios = (store) => {
  axios.defaults.baseURL = "https://readjourney.b.goit.study/api";

  // Flag to track token refresh process
  let isRefreshing = false;
  let failedQueue = [];

  // Process queue of requests
  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  };

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        // If we're already refreshing the token, add request to queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // FIXED: Using the correct endpoint for token refresh with GET method
          const { data } = await axios.get("/users/current/refresh", {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          // Dispatch action to update tokens in store
          store.dispatch({
            type: "auth/refreshTokenSuccess",
            payload: {
              token: data.token,
              refreshToken: data.refreshToken,
            },
          });

          // Process queued requests
          processQueue(null, data.token);

          // Set new token for current request
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          // Retry original request with new token
          return axios(originalRequest);
        } catch (refreshError) {
          // Process all pending requests with error
          processQueue(refreshError, null);

          // Log out on failed token refresh
          store.dispatch({
            type: "auth/logout/fulfilled",
          });

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return axios;
};
