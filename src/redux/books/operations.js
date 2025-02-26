import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API функции
const fetchRecommendedBooksApi = async (
  page = 1,
  perPage = 10,
  filters = {}
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("perPage", perPage);
    if (filters.title) params.append("title", filters.title);
    if (filters.author) params.append("author", filters.author);

    const response = await axios.get(`/books/recommend?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch recommended books"
    );
  }
};

const addBookToLibraryApi = async (bookId) => {
  try {
    const response = await axios.post(`/books/add/${bookId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add book to library"
    );
  }
};

const fetchUserLibraryApi = async () => {
  try {
    const response = await axios.get("/books/user");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user library"
    );
  }
};

// Async thunks
export const fetchRecommendedBooksAsync = createAsyncThunk(
  "books/fetchRecommended",
  async ({ page, perPage, filters }, { rejectWithValue }) => {
    try {
      return await fetchRecommendedBooksApi(page, perPage, filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBookToLibraryAsync = createAsyncThunk(
  "books/addToLibrary",
  async (bookId, { rejectWithValue }) => {
    try {
      return await addBookToLibraryApi(bookId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserLibraryAsync = createAsyncThunk(
  "books/fetchUserLibrary",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUserLibraryApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Операции
export const loadRecommendedBooks = () => (dispatch, getState) => {
  const { books } = getState();
  const { currentPage, perPage } = books.recommended;
  const { filters } = books;
  dispatch(fetchRecommendedBooksAsync({ page: currentPage, perPage, filters }));
};

export const changeRecommendedPage = (newPage) => (dispatch) => {
  dispatch({ type: "books/setCurrentPage", payload: newPage });
  dispatch(loadRecommendedBooks());
};

export const applyFilters = (newFilters) => (dispatch) => {
  dispatch({ type: "books/setFilters", payload: newFilters });
  dispatch(loadRecommendedBooks());
};

export const selectBookDetails = (book) => (dispatch) => {
  dispatch({ type: "books/setSelectedBook", payload: book });
};

export const addBookAndCloseModal = (bookId) => async (dispatch) => {
  await dispatch(addBookToLibraryAsync(bookId));
  dispatch({ type: "books/clearSelectedBook" });
};

export const clearSelectedBook = () => (dispatch) => {
  dispatch({ type: "books/clearSelectedBook" });
};
