import { useDispatch } from "react-redux";
import styles from "./MyLibraryBooks.module.css";
import BookCard from "../BookCard/BookCard";

const MyLibraryBooks = ({
  books,
  isLoading,
  error,
  onBookClick,
  onFilterChange,
  currentFilter,
}) => {
  const dispatch = useDispatch();

  const handleRemoveBook = (bookId) => {
    // Dispatch action to remove book
    // This would need to be implemented in the redux operations
    console.log("Remove book:", bookId);
  };

  if (error) {
    return (
      <div className={styles.error}>Error loading your library: {error}</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My library</h1>
        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">All books</option>
            <option value="in-progress">Reading</option>
            <option value="finished">Finished</option>
            <option value="unread">To read</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : books.length > 0 ? (
        <div className={styles.booksGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id || book._id}
              book={book}
              onClick={() => onBookClick(book)}
              onRemove={() => handleRemoveBook(book.id || book._id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <img src="/images/books-stack.svg" alt="Books stack" />
          </div>
          <p className={styles.emptyStateText}>
            To start training, add{" "}
            <span className={styles.highlight}>one of your books</span> or from
            the recommended ones
          </p>
        </div>
      )}
    </div>
  );
};

export default MyLibraryBooks;
