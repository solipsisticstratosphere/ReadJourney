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

  if (!persistedToken && !persistedRefreshToken) {
    return thunkAPI.rejectWithValue("No valid tokens");
  }

  try {
    // Try using the main token first
    if (persistedToken) {
      setAuthHeader(persistedToken);
      try {
        const response = await axios.get("/users/current");
        return response.data;
      } catch (error) {
        // If main token doesn't work but we have a refresh token
        if (error.response?.status === 401 && persistedRefreshToken) {
          console.log("Using refresh token to get new access token");
        } else {
          throw error;
        }
      }
    }

    // Try refreshing tokens using the refresh endpoint
    if (persistedRefreshToken) {
      try {
        // Use the correct endpoint for refreshing tokens (GET instead of POST)
        const refreshResponse = await axios.get("/users/current/refresh", {
          headers: {
            Authorization: `Bearer ${persistedRefreshToken}`,
          },
        });

        // Save new tokens
        const newToken = refreshResponse.data.token;
        const newRefreshToken = refreshResponse.data.refreshToken;

        setAuthHeader(newToken);

        // Get user data with new token
        const userResponse = await axios.get("/users/current");

        return {
          ...userResponse.data,
          token: newToken,
          refreshToken: newRefreshToken,
        };
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return thunkAPI.rejectWithValue("Token refresh failed");
      }
    }
  } catch (error) {
    console.error("Failed to refresh user:", error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to refresh user"
    );
  }
});
