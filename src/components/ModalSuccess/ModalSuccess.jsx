import styles from "./ModalSuccess.module.css";
import like from "../../assets/images/like.png";
import { useEffect, useRef } from "react";
const ModalSuccess = ({ children, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>{children}</div>
    </div>
  );
};

const SuccessModal = ({ showSuccessModal, handleCloseSuccessModal }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleCloseSuccessModal();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleCloseSuccessModal();
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
  }, [handleCloseSuccessModal]);
  return (
    <ModalSuccess onClose={handleCloseSuccessModal}>
      <div className={styles.successModal} ref={modalRef}>
        <div className={styles.thumbsUpContainer}>
          <img src={like} alt="" className={styles.mobilePreviewImage} />
        </div>

        <h2 className={styles.successTitle}>Good job</h2>

        <p className={styles.successMessage}>
          Your book is now in{"  "}
          <span className={styles.highlight}>{"  "}the library!</span> The joy
          knows no bounds and now you can start your training
        </p>

        <button
          className={styles.closeButton}
          onClick={handleCloseSuccessModal}
          aria-label="Close modal"
        >
          <span className={styles.closeIcon}>×</span>
        </button>
      </div>
    </ModalSuccess>
  );
};

export default SuccessModal;
