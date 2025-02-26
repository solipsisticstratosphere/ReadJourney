// Recommended books selectors
export const selectRecommendedBooks = (state) => state.books.recommended.items;
export const selectRecommendedBooksLoading = (state) =>
  state.books.recommended.isLoading;
export const selectRecommendedBooksError = (state) =>
  state.books.recommended.error;
export const selectCurrentPage = (state) => state.books.recommended.currentPage;
export const selectTotalPages = (state) => state.books.recommended.totalPages;
export const selectPerPage = (state) => state.books.recommended.perPage;

// Library books selectors
export const selectLibraryBooks = (state) => state.books.library.items;
export const selectLibraryLoading = (state) => state.books.library.isLoading;
export const selectLibraryError = (state) => state.books.library.error;

// Filters selectors
export const selectFilters = (state) => state.books.filters;

// Selected book selector
export const selectSelectedBook = (state) => state.books.selectedBook;

// Complex selectors
export const selectHasRecommendedBooks = (state) =>
  state.books.recommended.items.length > 0;
export const selectHasLibraryBooks = (state) =>
  state.books.library.items.length > 0;

// Helper for checking if a book is already in the library
export const selectIsBookInLibrary = (state, bookId) => {
  return state.books.library.items.some((book) => book._id === bookId);
};
