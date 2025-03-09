import axios from "axios";

export const setupAxios = (store) => {
  axios.defaults.baseURL = "https://readjourney.b.goit.study/api";

  let isRefreshing = false;
  let failedQueue = [];

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

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
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

          const { data } = await axios.get("/users/current/refresh", {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          store.dispatch({
            type: "auth/refreshTokenSuccess",
            payload: {
              token: data.token,
              refreshToken: data.refreshToken,
            },
          });

          processQueue(null, data.token);

          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

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
