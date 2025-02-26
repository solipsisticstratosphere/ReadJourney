import { createAsyncThunk } from "@reduxjs/toolkit";
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

const addBookToLibraryApi = async (bookData) => {
  try {
    // If bookData is an object with book details, send POST request to /books/add
    // If bookData is just an ID, use the existing endpoint
    if (typeof bookData === "object" && bookData.title) {
      const response = await axios.post("/books/add", bookData);
      return response.data;
    } else {
      // Original implementation for adding existing books by ID
      const bookId = bookData;
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
  async (bookData, { rejectWithValue }) => {
    try {
      return await addBookToLibraryApi(bookData);
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
