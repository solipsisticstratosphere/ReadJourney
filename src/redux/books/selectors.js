// Селекторы для раздела рекомендаций
export const selectRecommendedBooks = (state) => state.books.recommended.items;
export const selectRecommendedBooksLoading = (state) =>
  state.books.recommended.isLoading;
export const selectRecommendedBooksError = (state) =>
  state.books.recommended.error;
export const selectRecommendedCurrentPage = (state) =>
  state.books.recommended.currentPage;
export const selectRecommendedTotalPages = (state) =>
  state.books.recommended.totalPages;
export const selectRecommendedPerPage = (state) =>
  state.books.recommended.perPage;
export const selectLibraryAddBookError = (state) =>
  state.books.library.addBookError;
// Селекторы для ограниченных рекомендаций
export const selectLimitedRecommendedBooks = (state) =>
  state.books.limitedRecommended.items;
export const selectLimitedRecommendedBooksLoading = (state) =>
  state.books.limitedRecommended.isLoading;
export const selectLimitedRecommendedBooksError = (state) =>
  state.books.limitedRecommended.error;

// Селекторы для библиотеки пользователя
export const selectUserLibrary = (state) => state.books.library.items;
export const selectUserLibraryLoading = (state) =>
  state.books.library.isLoading;
export const selectUserLibraryError = (state) => state.books.library.error;

// Селекторы для фильтров
export const selectBookFilters = (state) => state.books.filters;

// Селектор для выбранной книги
export const selectSelectedBook = (state) => state.books.selectedBook;

// Новые селекторы для функциональности чтения
export const selectCurrentBook = (state) => state.books.reading.currentBook;
export const selectIsReadingLoading = (state) => state.books.reading.isLoading;
export const selectReadingError = (state) => state.books.reading.error;
export const selectIsReadingActive = (state) =>
  state.books.reading.isReadingActive;

// Селектор для получения текущей страницы книги
export const selectCurrentBookPage = (state) => {
  const book = state.books.reading.currentBook;
  if (!book) return 0;

  // Определяем текущую страницу по последней записи в прогрессе
  const progressEntries = book.progress || [];
  if (progressEntries.length > 0) {
    const lastEntry = progressEntries[progressEntries.length - 1];
    return lastEntry.finishPage || lastEntry.startPage || 0;
  }

  return 0;
};

// Селектор для получения информации о оставшемся времени чтения
export const selectTimeLeftToRead = (state) => {
  const book = state.books.reading.currentBook;
  return book?.timeLeftToRead || { hours: 0, minutes: 0, seconds: 0 };
};

// Селектор для получения статистики чтения
export const selectReadingStats = (state) => {
  const book = state.books.reading.currentBook;
  if (!book) return null;

  const totalPages = book.totalPages || 0;
  let currentPage = 0;

  // Определяем текущую страницу по последней записи в прогрессе
  const progressEntries = book.progress || [];
  if (progressEntries.length > 0) {
    const lastEntry = progressEntries[progressEntries.length - 1];
    currentPage = lastEntry.finishPage || lastEntry.startPage || 0;
  }

  // Считаем процент прогресса
  const progressPercentage =
    totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  // Средняя скорость чтения (страниц в час)
  let avgReadingSpeed = 0;
  let totalPagesRead = 0;
  let totalReadingTimeInMinutes = 0;

  progressEntries.forEach((entry) => {
    if (entry.status === "inactive" && entry.finishPage && entry.startPage) {
      const pagesRead = entry.finishPage - entry.startPage;
      const startTime = new Date(entry.startReading);
      const endTime = new Date(entry.finishReading);
      const readingTimeInMinutes = (endTime - startTime) / (1000 * 60);

      if (readingTimeInMinutes > 0) {
        totalPagesRead += pagesRead;
        totalReadingTimeInMinutes += readingTimeInMinutes;
      }
    }
  });

  if (totalReadingTimeInMinutes > 0) {
    avgReadingSpeed = (totalPagesRead / totalReadingTimeInMinutes) * 60; // страниц в час
  }

  return {
    totalPages,
    currentPage,
    progressPercentage,
    pagesLeft: totalPages - currentPage,
    avgReadingSpeed: Math.round(avgReadingSpeed),
    timeLeftToRead: book.timeLeftToRead || { hours: 0, minutes: 0, seconds: 0 },
  };
};
