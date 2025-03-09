import styles from "./BookCompletedModal.module.css";
import booksIcon from "../../assets/images/smallBooks.png";

const BookCompletedModal = ({ isOpen, onClose, bookTitle }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.congratsContainer}>
          <div className={styles.booksIconContainer}>
            <img src={booksIcon} alt="Books" className={styles.booksIcon} />
          </div>

          <h2 className={styles.modalTitle}>The book is read</h2>

          <p className={styles.modalText}>
            It was an <span className={styles.highlight}>exciting journey</span>
            , where each page revealed new horizons, and the characters became
            inseparable friends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookCompletedModal;
