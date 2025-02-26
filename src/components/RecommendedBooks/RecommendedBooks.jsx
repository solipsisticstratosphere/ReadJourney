import styles from "./RecommendedBooks.module.css";
import BookCard from "../BookCard/BookCard";

const RecommendedBooks = ({
  books,
  currentPage,
  totalPages,
  onPageChange,
  onBookClick,
  isLoading,
}) => {
  // Check if books array is empty
  const noBooksFound = books.length === 0 && !isLoading;

  return (
    <div className={styles.recommendedBooks}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recommended</h1>
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading || noBooksFound}
          >
            &lt;
          </button>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading || noBooksFound}
          >
            &gt;
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : noBooksFound ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3 className={styles.emptyStateTitle}>No books found</h3>
          <p className={styles.emptyStateText}>
            Try changing your search parameters or try again later.
          </p>
        </div>
      ) : (
        <div className={styles.booksGrid}>
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onClick={() => onBookClick(book)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedBooks;
