import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "../../components/Dashboard/Dashboard";
import RecommendedBooks from "../../components/RecommendedBooks/RecommendedBooks";

import {
  loadRecommendedBooks,
  changeRecommendedPage,
  applyFilters,
  selectBookDetails,
  addBookAndCloseModal,
  clearSelectedBook,
  setupResponsiveListener,
  addBookToLibraryAsync,
} from "../../redux/books/operations";

import {
  selectRecommendedBooks,
  selectRecommendedBooksLoading,
  selectRecommendedBooksError,
  selectRecommendedCurrentPage,
  selectRecommendedTotalPages,
  selectRecommendedPerPage,
  selectBookFilters,
  selectSelectedBook,
  selectLibraryAddBookError, // Import the new selector
} from "../../redux/books/selectors";

import { clearAddBookError } from "../../redux/books/slice"; // Import the new action

import styles from "./RecommendedPage.module.css";
import BookDetailsModal from "../../components/BookDetailsModal/BookDetailsModal";

const RecommendedPage = () => {
  const dispatch = useDispatch();

  // Select data from Redux store
  const books = useSelector(selectRecommendedBooks);
  const isLoading = useSelector(selectRecommendedBooksLoading);
  const currentPage = useSelector(selectRecommendedCurrentPage);
  const totalPages = useSelector(selectRecommendedTotalPages);
  const filters = useSelector(selectBookFilters);
  const selectedBook = useSelector(selectSelectedBook);
  const addBookError = useSelector(selectLibraryAddBookError); // New selector

  // Load books on initial render and setup responsive listener
  useEffect(() => {
    const cleanupListener = dispatch(setupResponsiveListener());
    dispatch(loadRecommendedBooks());

    // Очищаем слушатель при размонтировании компонента
    return () => {
      if (typeof cleanupListener === "function") {
        cleanupListener();
      }
    };
  }, [dispatch]);

  // Clear add book error when modal is closed
  useEffect(() => {
    if (!selectedBook) {
      dispatch(clearAddBookError());
    }
  }, [selectedBook, dispatch]);

  // Handlers
  const handlePageChange = (newPage) => {
    dispatch(changeRecommendedPage(newPage));
  };

  const handleFilterSubmit = (newFilters) => {
    dispatch(applyFilters(newFilters));
  };

  const handleBookClick = (book) => {
    dispatch(selectBookDetails(book));
  };

  const handleCloseModal = () => {
    dispatch(clearSelectedBook());
  };

  const handleAddToLibrary = (bookId) => {
    dispatch(addBookToLibraryAsync(bookId));
  };

  // Check if modal should be open
  const isModalOpen = !!selectedBook;

  return (
    <div className={styles.recommendedPage}>
      <Dashboard
        page="recommended"
        onFilterSubmit={handleFilterSubmit}
        filters={filters}
      />
      <RecommendedBooks
        books={books}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onBookClick={handleBookClick}
        isLoading={isLoading}
      />
      {isModalOpen && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onAddToLibrary={() => handleAddToLibrary(selectedBook._id)}
          addBookError={addBookError} // Pass the error to the modal
        />
      )}
    </div>
  );
};

export default RecommendedPage;
