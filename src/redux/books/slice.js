import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRecommendedBooksAsync,
  fetchLimitedRecommendedBooksAsync,
  addBookToLibraryAsync,
  fetchUserLibraryAsync,
  getPerPageByScreenWidth,
  loadBookForReadingAsync,
  loadCurrentBookAsync,
  updateReadingProgressAsync,
  startReadingSessionAsync,
  stopReadingSessionAsync,
  removeBookFromLibraryAsync,
  deleteReadingSession,
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
  limitedRecommended: {
    items: [],
    isLoading: false,
    error: null,
  },
  library: {
    items: [],
    isLoading: false,
    error: null,
  },
  reading: {
    currentBook: null,
    isLoading: false,
    error: null,
    isReadingActive: false,
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
      // Обработка обычных рекомендаций
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

      // Обработка ограниченных рекомендаций (3 книги)
      .addCase(fetchLimitedRecommendedBooksAsync.pending, (state) => {
        state.limitedRecommended.isLoading = true;
        state.limitedRecommended.error = null;
      })
      .addCase(fetchLimitedRecommendedBooksAsync.fulfilled, (state, action) => {
        state.limitedRecommended.isLoading = false;
        state.limitedRecommended.items = action.payload.results.slice(0, 3); // Гарантируем, что будет не больше 3 книг
      })
      .addCase(fetchLimitedRecommendedBooksAsync.rejected, (state, action) => {
        state.limitedRecommended.isLoading = false;
        state.limitedRecommended.error =
          action.payload ||
          "Произошла ошибка при загрузке ограниченных рекомендаций";
      })

      // Обработка библиотеки и добавления книг
      .addCase(addBookToLibraryAsync.pending, (state) => {
        state.library.isLoading = true;
        state.library.error = null;
      })
      .addCase(addBookToLibraryAsync.fulfilled, (state, action) => {
        state.library.isLoading = false;
        // Проверяем, есть ли уже такая книга в библиотеке
        const existingBookIndex = state.library.items.findIndex(
          (book) => book._id === action.payload._id
        );

        if (existingBookIndex !== -1) {
          // Обновляем существующую книгу
          state.library.items[existingBookIndex] = action.payload;
        } else {
          // Добавляем новую книгу
          state.library.items = [...state.library.items, action.payload];
        }
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
        state.library.items = action.payload || [];
      })
      .addCase(fetchUserLibraryAsync.rejected, (state, action) => {
        state.library.isLoading = false;
        state.library.error =
          action.payload || "Произошла ошибка при загрузке библиотеки";
      })

      // Обработка удаления книги из библиотеки
      .addCase(removeBookFromLibraryAsync.pending, (state) => {
        state.library.isLoading = true;
        state.library.error = null;
      })
      .addCase(removeBookFromLibraryAsync.fulfilled, (state, action) => {
        state.library.isLoading = false;
        // Удаляем книгу из массива по ID
        state.library.items = state.library.items.filter(
          (book) => book._id !== action.payload
        );
      })
      .addCase(removeBookFromLibraryAsync.rejected, (state, action) => {
        state.library.isLoading = false;
        state.library.error =
          action.payload || "Произошла ошибка при удалении книги из библиотеки";
      })

      // Обработка функциональности чтения
      .addCase(loadBookForReadingAsync.pending, (state) => {
        state.reading.isLoading = true;
        state.reading.error = null;
      })
      .addCase(loadBookForReadingAsync.fulfilled, (state, action) => {
        state.reading.isLoading = false;
        state.reading.currentBook = action.payload;

        // Определяем, активна ли сессия чтения по последней записи в прогрессе
        const progressEntries = action.payload.progress || [];
        if (progressEntries.length > 0) {
          const lastEntry = progressEntries[progressEntries.length - 1];
          state.reading.isReadingActive = lastEntry.status === "active";
        } else {
          state.reading.isReadingActive = false;
        }
      })
      .addCase(loadBookForReadingAsync.rejected, (state, action) => {
        state.reading.isLoading = false;
        state.reading.error =
          action.payload || "Произошла ошибка при загрузке книги для чтения";
      })

      // Обработка загрузки текущей книги для Dashboard
      .addCase(loadCurrentBookAsync.pending, (state) => {
        state.reading.isLoading = true;
        state.reading.error = null;
      })
      .addCase(loadCurrentBookAsync.fulfilled, (state, action) => {
        state.reading.isLoading = false;
        state.reading.currentBook = action.payload;

        // Определяем, активна ли сессия чтения
        const progressEntries = action.payload.progress || [];
        if (progressEntries.length > 0) {
          const lastEntry = progressEntries[progressEntries.length - 1];
          state.reading.isReadingActive = lastEntry.status === "active";
        } else {
          state.reading.isReadingActive = false;
        }
      })
      .addCase(loadCurrentBookAsync.rejected, (state, action) => {
        state.reading.isLoading = false;
        state.reading.error =
          action.payload || "Произошла ошибка при загрузке текущей книги";
      })

      // Обработка обновления прогресса чтения
      .addCase(updateReadingProgressAsync.pending, (state) => {
        // Здесь можно не менять isLoading, чтобы не блокировать интерфейс
      })
      .addCase(updateReadingProgressAsync.fulfilled, (state, action) => {
        // Обновляем информацию о книге
        state.reading.currentBook = action.payload;
      })
      .addCase(updateReadingProgressAsync.rejected, (state, action) => {
        state.reading.error =
          action.payload || "Произошла ошибка при обновлении прогресса чтения";
      })

      // Обработка начала сессии чтения
      .addCase(startReadingSessionAsync.pending, (state) => {
        // Можно показать индикатор загрузки, если нужно
      })
      .addCase(startReadingSessionAsync.fulfilled, (state, action) => {
        state.reading.currentBook = action.payload;
        state.reading.isReadingActive = true;
      })
      .addCase(startReadingSessionAsync.rejected, (state, action) => {
        state.reading.error =
          action.payload || "Произошла ошибка при начале сессии чтения";
      })

      // Обработка завершения сессии чтения
      .addCase(stopReadingSessionAsync.pending, (state) => {
        // Можно показать индикатор загрузки, если нужно
      })
      .addCase(stopReadingSessionAsync.fulfilled, (state, action) => {
        state.reading.currentBook = action.payload;
        state.reading.isReadingActive = false;
      })
      .addCase(stopReadingSessionAsync.rejected, (state, action) => {
        state.reading.error =
          action.payload || "Произошла ошибка при завершении сессии чтения";
      })
      .addCase(deleteReadingSession.fulfilled, (state, action) => {
        // Ensure we're updating the current book's progress
        if (state.reading.currentBook && state.reading.currentBook.progress) {
          state.reading.currentBook.progress =
            state.reading.currentBook.progress.filter(
              (session) => session._id !== action.payload.readingId
            );
        }
      })
      .addCase(deleteReadingSession.rejected, (state, action) => {
        state.reading.error =
          action.payload || "Произошла ошибка при удалении сессии чтения";
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
