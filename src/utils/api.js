import axios from "axios";

export const setupAxios = (store) => {
  axios.defaults.baseURL = "https://readjourney.b.goit.study/api";

  // Флаг для отслеживания процесса обновления токена
  let isRefreshing = false;
  let failedQueue = [];

  // Обработка очереди запросов
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

  // Запрос интерцептор
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

  // Ответ интерцептор
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        // Если мы уже обновляем токен, добавим запрос в очередь
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

          // Важное исправление: правильный URL для обновления токена
          // '/auth/refresh' должен быть заменен на '/users/refresh'
          const { data } = await axios.post(
            "/users/current/refresh", // Исправлено с '/auth/refresh'
            { refreshToken },
            { _retry: true } // Помечаем запрос, чтобы избежать зацикливания
          );

          // Диспатчим действие для обновления токенов в хранилище
          store.dispatch({
            type: "auth/refreshTokenSuccess",
            payload: {
              token: data.token,
              refreshToken: data.refreshToken,
            },
          });

          // Обрабатываем очередь запросов
          processQueue(null, data.token);

          // Устанавливаем новый токен для текущего запроса
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          // Возвращаемся к исходному запросу с новым токеном
          return axios(originalRequest);
        } catch (refreshError) {
          // Обрабатываем все ожидающие запросы с ошибкой
          processQueue(refreshError, null);

          // Выходим из системы при неудачном обновлении токена
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
