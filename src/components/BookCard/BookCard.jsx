import styles from "./BookCard.module.css";

const BookCard = ({ book, onClick, isLibraryView }) => {
  return (
    <div className={styles.bookCard}>
      <div className={styles.imageContainer} onClick={onClick}>
        <img
          src={book.imageUrl || "/images/book-placeholder.jpg"}
          alt={book.title}
          className={styles.bookCover}
        />
      </div>
      <div className={styles.bookInfo}>
        <h3
          className={`${styles.bookTitle} ${
            isLibraryView ? styles.bookTitleLibraryView : ""
          }`}
        >
          {book.title}
        </h3>
        <p
          className={`${styles.bookAuthor} ${
            isLibraryView ? styles.bookAuthorLibraryView : ""
          }`}
        >
          {book.author}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
