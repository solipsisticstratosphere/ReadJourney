import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "../../components/Dashboard/Dashboard";
import RecommendedBooks from "../../components/RecommendedBooks/RecommendedBooks";
// import BookDetailsModal from "../../components/BookDetailsModal/BookDetailsModal";

// Импорты операций и селекторов из новой структуры
import {
  loadRecommendedBooks,
  changeRecommendedPage,
  applyFilters,
  selectBookDetails,
  addBookAndCloseModal,
  clearSelectedBook,
  setupResponsiveListener,
} from "../../redux/books/operations";

import {
  selectRecommendedBooks,
  selectRecommendedBooksLoading,
  selectCurrentPage,
  selectTotalPages,
  selectFilters,
  selectSelectedBook,
} from "../../redux/books/selectors";

import styles from "./RecommendedPage.module.css";
import BookDetailsModal from "../../components/BookDetailsModal/BookDetailsModal";

const RecommendedPage = () => {
  const dispatch = useDispatch();

  // Select data from Redux store
  const books = useSelector(selectRecommendedBooks);
  const isLoading = useSelector(selectRecommendedBooksLoading);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const filters = useSelector(selectFilters);
  const selectedBook = useSelector(selectSelectedBook);

  // Load books on initial render and setup responsive listener
  useEffect(() => {
    const cleanupListener = dispatch(setupResponsiveListener());
    dispatch(loadRecommendedBooks());

    // Устанавливаем слушатель изменения размера окна

    // Очищаем слушатель при размонтировании компонента
    return () => {
      if (typeof cleanupListener === "function") {
        cleanupListener();
      }
    };
  }, [dispatch]);

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
    dispatch(addBookAndCloseModal(bookId));
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
        />
      )}
    </div>
  );
};

export default RecommendedPage;
