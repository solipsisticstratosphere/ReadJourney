import styles from "./BookCard.module.css";

const BookCard = ({ book, onClick, isLibraryView, onRemove }) => {
  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(book.id || book._id);
  };

  return (
    <div className={styles.bookCard}>
      <div className={styles.imageContainer} onClick={onClick}>
        <img
          src={book.imageUrl || "/src/assets/images/book-placeholder.jpg"}
          alt={book.title}
          className={styles.bookCover}
        />
      </div>

      <div className={styles.bookInfo}>
        <h3 className={`${styles.bookTitle} `}>{book.title}</h3>
        <p
          className={`${styles.bookAuthor}
          }`}
        >
          {book.author}
        </p>
        {isLibraryView && onRemove && (
          <button className={styles.deleteButton} onClick={handleRemoveClick}>
            <svg className={styles.deleteSvg} width="24" height="24">
              <use href="/sprite.svg#trash-bin" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
