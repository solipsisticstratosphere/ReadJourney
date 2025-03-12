import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { clearAddBookError, setAddBookError } from "./slice";

export const getPerPageByScreenWidth = () => {
  if (typeof window === "undefined") {
    return 10;
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

const fetchRecommendedBooksApi = async (
  page = 1,
  perPage = getPerPageByScreenWidth(),
  filters = {}
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", perPage);
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

const fetchLimitedRecommendedBooksApi = async () => {
  try {
    const params = new URLSearchParams();
    params.append("page", 1);
    params.append("limit", 3);

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
  const bookId = typeof bookData === "object" ? bookData._id : bookData;

  const isBookInLibrary = currentLibrary.some(
    (book) =>
      book._id === bookId ||
      (typeof bookData === "object" &&
        bookData.title &&
        book.title === bookData.title)
  );

  if (isBookInLibrary) {
    const error = new Error("This book is already in your library");
    error.name = "DuplicateBookError";
    throw error;
  }

  try {
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

const loadBookForReadingApi = async (bookId) => {
  try {
    
    const response = await axios.get(`/books/${bookId}`);
    
    return response.data;
  } catch (error) {
 
    throw new Error(
      error.response?.data?.message || "Failed to load book for reading"
    );
  }
};

const updateReadingProgressApi = async ({ bookId, currentPage }) => {
  try {
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
    return bookId;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to remove book from library"
    );
  }
};

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

export const loadBookForReadingAsync = createAsyncThunk(
  "books/loadBookForReading",
  async (bookId, { rejectWithValue }) => {
    try {
     
      const result = await loadBookForReadingApi(bookId);
      
      return result;
    } catch (error) {
      
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

export const loadLimitedRecommendedBooks = () => (dispatch) => {
  dispatch(fetchLimitedRecommendedBooksAsync());
};

export const setupResponsiveListener = () => (dispatch, getState) => {
  let resizeTimer;

  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const oldPerPage = getState().books.recommended.perPage;

      const newPerPage = getPerPageByScreenWidth();

      if (oldPerPage !== newPerPage) {
        dispatch({ type: "books/updatePerPage", payload: newPerPage });
        dispatch(loadRecommendedBooks());
      }
    }, 250);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

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

export const addBookAndCloseModal = (bookId) => (dispatch, getState) => {
  const currentLibrary = getState().books.library.items;
  const selectedBook = getState().books.selectedBook;

  const isBookInLibrary = currentLibrary.some(
    (book) => book.title.toLowerCase() === selectedBook.title.toLowerCase()
  );

  if (isBookInLibrary) {
    dispatch(setAddBookError("This book is already in your library"));
  } else {
    dispatch(clearAddBookError());
    dispatch(addBookToLibraryAsync(bookId)).then(() => {
      dispatch(clearSelectedBook());
    });
  }
};

export const clearSelectedBook = () => (dispatch) => {
  dispatch({ type: "books/clearSelectedBook" });
};

export const removeBookAndRefresh = (bookId) => async (dispatch) => {
  await dispatch(removeBookFromLibraryAsync(bookId));
  dispatch(fetchUserLibraryAsync());
};
