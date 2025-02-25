import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Set axios defaults
axios.defaults.baseURL = "https://readjourney.b.goit.study/api";

// Helper functions
const setAuthHeader = (token) => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearAuthHeader = () => {
  axios.defaults.headers.common.Authorization = "";
};

// Define thunk action types as constants to avoid circular imports
const REGISTER = "auth/register";
const LOGIN = "auth/login";
const LOGOUT = "auth/logout";
const REFRESH = "auth/refresh";

// Create async thunks with explicit type constants
export const register = createAsyncThunk(
  REGISTER,
  async (credentials, thunkAPI) => {
    try {
      const response = await axios.post("/users/signup", credentials);
      setAuthHeader(response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const login = createAsyncThunk(LOGIN, async (credentials, thunkAPI) => {
  try {
    const response = await axios.post("/users/signin", credentials);
    setAuthHeader(response.data.token);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed"
    );
  }
});

export const logout = createAsyncThunk(LOGOUT, async (_, thunkAPI) => {
  try {
    await axios.post("/users/signout");
    clearAuthHeader();
    localStorage.removeItem("persist:auth");
    return null;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Logout failed"
    );
  }
});

export const refreshUser = createAsyncThunk(REFRESH, async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const persistedToken = state.auth.token;
  const persistedRefreshToken = state.auth.refreshToken;

  if (!persistedToken) {
    return thunkAPI.rejectWithValue("No valid token");
  }

  try {
    setAuthHeader(persistedToken);
    const response = await axios.get("/users/current");
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && persistedRefreshToken) {
      try {
        const refreshResponse = await axios.post("/users/current/refresh", {
          refreshToken: persistedRefreshToken,
        });

        setAuthHeader(refreshResponse.data.token);
        const userResponse = await axios.get("/users/current");

        return {
          ...userResponse.data,
          token: refreshResponse.data.token,
          refreshToken: refreshResponse.data.refreshToken,
        };
      } catch (refreshError) {
        return thunkAPI.rejectWithValue("Token refresh failed");
      }
    }

    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to refresh user"
    );
  }
});
