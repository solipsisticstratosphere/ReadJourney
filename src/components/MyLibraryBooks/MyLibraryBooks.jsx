import { useDispatch } from "react-redux";
import styles from "./MyLibraryBooks.module.css";
import BookCard from "../BookCard/BookCard";
import {
  removeBookAndRefresh,
  removeBookFromLibraryAsync,
} from "../../redux/books/operations";
import booksIcon from "../../assets/images/smallBooks.png";
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
    dispatch(removeBookAndRefresh(bookId));
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
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
            <option value="unread">Unread</option>
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
              isLibraryView={true}
              onRemove={handleRemoveBook}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <img src={booksIcon} alt="Books" className={styles.booksIcon} />
          </div>
          <p className={styles.emptyStateText}>
            To start training, add{" "}
            <span className={styles.highlight}>some of your books</span> or from
            the recommended ones
          </p>
        </div>
      )}
    </div>
  );
};

export default MyLibraryBooks;
