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
  return (
    <div className={styles.recommendedBooks}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recommended</h1>
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            &lt;
          </button>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            &gt;
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.booksGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id}
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
