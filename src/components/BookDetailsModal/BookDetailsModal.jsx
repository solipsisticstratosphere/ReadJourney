import { useEffect, useRef } from "react";
import styles from "./BookDetailsModal.module.css";

const BookDetailsModal = ({ book, onClose, onAddToLibrary }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);

    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.modalContent}>
          <div className={styles.bookCoverContainer}>
            <img
              src={book.imageUrl || "/images/book-placeholder.jpg"}
              alt={book.title}
              className={styles.bookCover}
            />
          </div>

          <div className={styles.bookDetails}>
            <h2 className={styles.bookTitle}>{book.title}</h2>
            <p className={styles.bookAuthor}>{book.author}</p>

            {book.totalPages && (
              <p className={styles.bookInfo}>
                <span className={styles.infoLabel}>Pages:</span>{" "}
                {book.totalPages}
              </p>
            )}

            <button
              className={styles.addToLibraryButton}
              onClick={() => onAddToLibrary(book.id)}
            >
              Add to library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
