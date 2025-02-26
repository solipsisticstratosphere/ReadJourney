import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRecommendedBooksAsync,
  addBookToLibraryAsync,
  fetchUserLibraryAsync,
  getPerPageByScreenWidth,
} from "./operations";

const initialState = {
  recommended: {
    items: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    perPage: typeof window !== "undefined" ? getPerPageByScreenWidth() : 10,
  },
  library: {
    items: [],
    isLoading: false,
    error: null,
  },
  filters: {
    title: "",
    author: "",
  },
  selectedBook: null,
};

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.recommended.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.recommended.currentPage = action.payload;
    },
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
    updatePerPage: (state, action) => {
      state.recommended.perPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedBooksAsync.pending, (state) => {
        state.recommended.isLoading = true;
        state.recommended.error = null;
      })
      .addCase(fetchRecommendedBooksAsync.fulfilled, (state, action) => {
        state.recommended.isLoading = false;
        state.recommended.items = action.payload.results;
        state.recommended.totalPages = action.payload.totalPages;
        state.recommended.currentPage = action.payload.page;
        state.recommended.perPage = action.payload.perPage;
      })
      .addCase(fetchRecommendedBooksAsync.rejected, (state, action) => {
        state.recommended.isLoading = false;
        state.recommended.error =
          action.payload ||
          "Произошла ошибка при загрузке рекомендованных книг";
      })
      .addCase(addBookToLibraryAsync.pending, (state) => {
        state.library.isLoading = true;
        state.library.error = null;
      })
      .addCase(addBookToLibraryAsync.fulfilled, (state, action) => {
        state.library.isLoading = false;
        state.library.items = [...state.library.items, action.payload];
      })
      .addCase(addBookToLibraryAsync.rejected, (state, action) => {
        state.library.isLoading = false;
        state.library.error =
          action.payload ||
          "Произошла ошибка при добавлении книги в библиотеку";
      })
      .addCase(fetchUserLibraryAsync.pending, (state) => {
        state.library.isLoading = true;
        state.library.error = null;
      })
      .addCase(fetchUserLibraryAsync.fulfilled, (state, action) => {
        state.library.isLoading = false;
        state.library.items = action.payload.books || [];
      })
      .addCase(fetchUserLibraryAsync.rejected, (state, action) => {
        state.library.isLoading = false;
        state.library.error =
          action.payload || "Произошла ошибка при загрузке библиотеки";
      });
  },
});

export const {
  setFilters,
  setCurrentPage,
  setSelectedBook,
  clearSelectedBook,
  updatePerPage,
} = booksSlice.actions;

export default booksSlice.reducer;
