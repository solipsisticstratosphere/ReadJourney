// axiosConfig.js
import axios from "axios";

export const setupAxios = (store) => {
  axios.defaults.baseURL = "https://readjourney.b.goit.study/api";

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
      Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;
          if (!refreshToken) {
            // Здесь была логическая ошибка - проверка должна быть на отсутствие токена
            return Promise.reject(error);
          }
          const { data } = await axios.post(
            "/auth/refresh",
            { refreshToken },
            {}
          );
          store.dispatch({
            type: "auth/refreshTokenSuccess", // Используйте правильный action type из вашего slice
            payload: {
              token: data.token,
              refreshToken: data.refreshToken,
            },
          });

          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          store.dispatch({
            type: "auth/logout/fulfilled",
          });
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return axios;
};
