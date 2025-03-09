import styles from "./RecommendedBooks.module.css";
import BookCard from "../BookCard/BookCard";

const RecommendedBooks = ({
  books = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  onBookClick = () => {},
  isLoading = false,
  showLimited = false,
  isLibraryView = false,
}) => {
  const noBooksFound = books.length === 0 && !isLoading;

  return (
    <div
      className={`${styles.recommendedBooks} ${
        isLibraryView ? styles.recommendedBooksLibraryView : ""
      }`}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>{isLibraryView ? "" : "Recommended"}</h1>
        {!showLimited && (
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
        )}
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
        <div
          className={`${styles.booksGrid} ${
            isLibraryView ? styles.libraryGrid : ""
          }`}
        >
          {books.map((book, index) => (
            <BookCard
              key={book._id || book.id || index}
              book={book}
              onClick={() => onBookClick(book)}
              isLibraryView={isLibraryView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedBooks;
