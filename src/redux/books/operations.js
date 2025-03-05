import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Функция для определения количества книг в зависимости от ширины экрана
export const getPerPageByScreenWidth = () => {
  if (typeof window === "undefined") {
    return 10; // Для SSR возвращаем значение по умолчанию
  }

  const width = window.innerWidth;

  let perPage;
  if (width <= 375) {
    perPage = 2;
  } else if (width > 376 && width <= 1280) {
    perPage = 8;
  } else {
    perPage = 10;
  }

  return perPage;
};

// API функции
const fetchRecommendedBooksApi = async (
  page = 1,
  perPage = getPerPageByScreenWidth(),
  filters = {}
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", perPage); // Изменено с perPage на limit для бэкенда
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

// API-функция для ограниченного числа книг (3 книги для секции в библиотеке)
const fetchLimitedRecommendedBooksApi = async () => {
  try {
    const params = new URLSearchParams();
    params.append("page", 1);
    params.append("limit", 3); // Фиксированное ограничение в 3 книги

    const response = await axios.get(`/books/recommend?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch limited recommended books"
    );
  }
};

const addBookToLibraryApi = async (bookData, currentLibrary) => {
  // Determine the book ID
  const bookId = typeof bookData === "object" ? bookData._id : bookData;

  // More comprehensive check for book duplication
  const isBookInLibrary = currentLibrary.some(
    (book) =>
      book._id === bookId ||
      (typeof bookData === "object" &&
        bookData.title &&
        book.title === bookData.title)
  );

  if (isBookInLibrary) {
    // Throw a more specific error for UI handling
    const error = new Error("This book is already in your library");
    error.name = "DuplicateBookError";
    throw error;
  }

  try {
    // Existing book addition logic remains the same
    if (typeof bookData === "object" && bookData.title) {
      const response = await axios.post("/books/add", bookData);
      return response.data;
    } else {
      const response = await axios.post(`/books/add/${bookId}`);
      return response.data;
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add book to library"
    );
  }
};

const fetchUserLibraryApi = async () => {
  try {
    const response = await axios.get("/books/own");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user library"
    );
  }
};

// Новые API функции для чтения книг
const loadBookForReadingApi = async (bookId) => {
  try {
    console.log("API call with bookId:", bookId);
    const response = await axios.get(`/books/${bookId}`);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to load book for reading"
    );
  }
};

const updateReadingProgressApi = async ({ bookId, currentPage }) => {
  try {
    // Простое обновление текущей страницы без сессии чтения
    const response = await axios.put(`/books/${bookId}`, {
      currentPage: currentPage,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update reading progress"
    );
  }
};

const startReadingSessionApi = async ({ bookId, startPage }) => {
  try {
    const response = await axios.post(`/books/reading/start`, {
      id: bookId,
      page: startPage,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to start reading session"
    );
  }
};

const stopReadingSessionApi = async ({ bookId, currentPage }) => {
  try {
    const response = await axios.post(`/books/reading/finish`, {
      id: bookId,
      page: currentPage,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to stop reading session"
    );
  }
};
export const deleteReadingSession = createAsyncThunk(
  "books/deleteReadingSession",
  async ({ bookId, readingId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete("/books/reading", {
        params: {
          bookId: bookId,
          readingId: readingId,
        },
      });

      return { bookId, readingId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Delete failed" }
      );
    }
  }
);
const removeBookFromLibraryApi = async (bookId) => {
  try {
    const response = await axios.delete(`/books/remove/${bookId}`);
    return bookId; // Возвращаем ID удаленной книги для обновления состояния
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to remove book from library"
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

// Новый thunk для ограниченных рекомендаций (3 книги)
export const fetchLimitedRecommendedBooksAsync = createAsyncThunk(
  "books/fetchLimitedRecommended",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchLimitedRecommendedBooksApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBookToLibraryAsync = createAsyncThunk(
  "books/addToLibrary",
  async (bookData, { rejectWithValue, getState }) => {
    try {
      const currentLibrary = getState().books.library.items;

      return await addBookToLibraryApi(bookData, currentLibrary);
    } catch (error) {
      // Special handling for duplicate book error
      if (error.name === "DuplicateBookError") {
        return rejectWithValue("This book is already in your library");
      }
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

// Новые thunk для функциональности чтения
export const loadBookForReadingAsync = createAsyncThunk(
  "books/loadBookForReading",
  async (bookId, { rejectWithValue }) => {
    try {
      console.log("Thunk with bookId:", bookId);
      const result = await loadBookForReadingApi(bookId);
      console.log("Thunk result:", result);
      return result;
    } catch (error) {
      console.error("Thunk error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const loadCurrentBookAsync = createAsyncThunk(
  "books/loadCurrentBook",
  async (bookId, { rejectWithValue }) => {
    try {
      return await loadBookForReadingApi(bookId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReadingProgressAsync = createAsyncThunk(
  "books/updateReadingProgress",
  async ({ bookId, currentPage }, { rejectWithValue }) => {
    try {
      return await updateReadingProgressApi({ bookId, currentPage });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startReadingSessionAsync = createAsyncThunk(
  "books/startReadingSession",
  async ({ bookId, startPage }, { rejectWithValue }) => {
    try {
      return await startReadingSessionApi({ bookId, startPage });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const stopReadingSessionAsync = createAsyncThunk(
  "books/stopReadingSession",
  async ({ bookId, currentPage }, { rejectWithValue }) => {
    try {
      return await stopReadingSessionApi({ bookId, currentPage });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeBookFromLibraryAsync = createAsyncThunk(
  "books/removeFromLibrary",
  async (bookId, { rejectWithValue }) => {
    try {
      return await removeBookFromLibraryApi(bookId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Обновленная операция загрузки рекомендуемых книг
export const loadRecommendedBooks = () => (dispatch, getState) => {
  const { books } = getState();
  const { currentPage, perPage } = books.recommended;
  const { filters } = books;

  dispatch(
    fetchRecommendedBooksAsync({
      page: currentPage,
      perPage,
      filters,
    })
  );
};

// Новая операция для загрузки ограниченного числа рекомендуемых книг
export const loadLimitedRecommendedBooks = () => (dispatch) => {
  dispatch(fetchLimitedRecommendedBooksAsync());
};

// Добавляем обработчик изменения размера окна с дебаунсингом
export const setupResponsiveListener = () => (dispatch, getState) => {
  let resizeTimer;

  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Получаем текущий perPage
      const oldPerPage = getState().books.recommended.perPage;

      // Вычисляем новый perPage на основе текущего размера окна
      const newPerPage = getPerPageByScreenWidth();

      // Если значение изменилось, обновляем его в store и перезагружаем книги
      if (oldPerPage !== newPerPage) {
        dispatch({ type: "books/updatePerPage", payload: newPerPage });
        dispatch(loadRecommendedBooks());
      }
    }, 250);
  };

  // Запускаем при монтировании, чтобы установить начальное значение
  handleResize();

  window.addEventListener("resize", handleResize);

  // Возвращаем функцию очистки слушателя при размонтировании компонента
  return () => {
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimer);
  };
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

export const removeBookAndRefresh = (bookId) => async (dispatch) => {
  await dispatch(removeBookFromLibraryAsync(bookId));
  dispatch(fetchUserLibraryAsync());
};
``;
