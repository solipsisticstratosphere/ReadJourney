import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadBookForReadingAsync,
  updateReadingProgressAsync,
  startReadingSessionAsync,
  stopReadingSessionAsync,
} from "../../redux/books/operations";
import {
  selectCurrentBook,
  selectIsReadingLoading,
  selectReadingError,
  selectIsReadingActive,
} from "../../redux/books/selectors";

import styles from "./ReadingPage.module.css";
import Dashboard from "../../components/Dashboard/Dashboard";

const ReadingPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get book data from Redux
  const book = useSelector(selectCurrentBook);
  const isLoading = useSelector(selectIsReadingLoading);
  const error = useSelector(selectReadingError);
  const isReadingActive = useSelector(selectIsReadingActive);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Use a ref to prevent duplicate API calls
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Load book data only once when component mounts or bookId changes
    if (bookId && !hasLoadedRef.current) {
      dispatch(loadBookForReadingAsync(bookId));
      hasLoadedRef.current = true;
    }
  }, [bookId, dispatch]);

  // Update local state when book data changes
  const externalFormControl = {
    initialPage:
      book?.currentPage ||
      (book?.progress?.length > 0
        ? book.progress[book.progress.length - 1].finishPage
        : 1),
    totalPages: book?.totalPages || 1000,
    isReadingActive,
    onSubmit: async (data) => {
      if (isReadingActive) {
        await dispatch(
          stopReadingSessionAsync({
            bookId,
            currentPage: data.currentPage,
          })
        );
      } else {
        await dispatch(
          startReadingSessionAsync({
            bookId,
            startPage: data.currentPage,
          })
        );
      }
    },
  };

  const handleBackToLibrary = () => {
    navigate("/library");
  };

  // Function to toggle reading state
  const toggleReading = () => {
    if (!isReadingActive) {
      // Start reading session
      dispatch(
        startReadingSessionAsync({
          bookId,
          startPage: currentPage,
        })
      );
    } else {
      // Stop reading session
      dispatch(
        stopReadingSessionAsync({
          bookId,
          currentPage,
        })
      );
    }
  };

  // Function to update current page
  const handleStopPageChange = (e) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading && !book) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Book</h2>
        <p>{error}</p>
        <button onClick={handleBackToLibrary} className={styles.backButton}>
          Back to Library
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.errorContainer}>
        <h2>Book Not Found</h2>
        <p>Could not load book with ID: {bookId}</p>
        <button onClick={handleBackToLibrary} className={styles.backButton}>
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className={styles.readingPageContainer}>
      <div className={styles.mainContent}>
        <Dashboard
          page="reading"
          bookId={bookId}
          externalFormControl={externalFormControl}
        />

        <div className={styles.bookDisplaySide}>
          <h2 className={styles.sectionTitle}>My reading</h2>

          <div className={styles.bookContainer}>
            <div className={styles.bookCover}>
              <img
                src={book.imageUrl || "/src/assets/images/book-placeholder.jpg"}
                alt={`Cover for ${book.title}`}
              />
            </div>

            <h3 className={styles.bookTitle}>{book.title}</h3>
            <p className={styles.authorName}>{book.author}</p>

            <div className={styles.readingControls}>
              <button
                onClick={toggleReading}
                className={`${styles.readingButton} ${
                  isReadingActive ? styles.stopButton : styles.startButton
                }`}
              >
                <svg
                  className={styles.icon}
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  {isReadingActive ? (
                    <>
                      <circle
                        cx="25"
                        cy="25"
                        r="24"
                        stroke="#F9F9F9"
                        strokeWidth="2"
                      />
                      <rect
                        width="20"
                        height="20"
                        x="15"
                        y="15"
                        fill="#E90516"
                        rx="3"
                      />
                    </>
                  ) : (
                    <>
                      <circle cx="25" cy="25" r="20" fill="#E90516" />
                      <circle
                        cx="25"
                        cy="25"
                        r="24"
                        stroke="#F9F9F9"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
