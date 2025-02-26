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
