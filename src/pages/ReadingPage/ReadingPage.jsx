import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadBookForReadingAsync,
  updateReadingProgressAsync,
} from "../../redux/books/operations";
import {
  selectCurrentBook,
  selectIsReadingLoading,
  selectReadingError,
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isReading, setIsReading] = useState(false);

  // Use a ref to prevent duplicate API calls
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Load book data only once when component mounts or bookId changes
    if (bookId && !hasLoadedRef.current) {
      console.log("Loading book with ID:", bookId);
      dispatch(loadBookForReadingAsync(bookId));
      hasLoadedRef.current = true;
    }
  }, [bookId, dispatch]);

  // Update local state when book data changes, without triggering API calls
  useEffect(() => {
    if (book) {
      console.log("Updating local state from book data");
      setCurrentPage(book.currentPage || 1);
      setTotalPages(book.totalPages || 0);
    }
  }, [book]);

  const handleBackToLibrary = () => {
    navigate("/library");
  };

  // Function to toggle reading state
  const toggleReading = () => {
    setIsReading(!isReading);
    // Save progress when stopping
    if (isReading) {
      saveReadingProgress();
    }
  };

  // Function to save reading progress
  const saveReadingProgress = () => {
    dispatch(updateReadingProgressAsync({ bookId, currentPage }));
  };

  // Function to update stop page
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

  const readingSpeed = isReading ? book.pagesPerHour || 0 : 0;
  const progressPercentage = Math.round(
    (currentPage / (totalPages || 1)) * 100
  );

  return (
    <div className={styles.readingPageContainer}>
      <div className={styles.mainContent}>
        {/* Left side - Dashboard */}

        <div className={styles.diarySection}>
          <h3>Diary</h3>
          <Dashboard page="reading" bookId={bookId} />
        </div>

        {/* Right side - Book display */}
        <div className={styles.bookDisplaySide}>
          <h2 className={styles.sectionTitle}>My reading</h2>

          <div className={styles.bookContainer}>
            {book.imageUrl && (
              <div className={styles.bookCover}>
                <img src={book.imageUrl} alt={`Cover for ${book.title}`} />
              </div>
            )}

            <h3 className={styles.bookTitle}>{book.title}</h3>
            <p className={styles.authorName}>{book.author}</p>

            <div className={styles.readingControls}>
              <button
                onClick={toggleReading}
                className={`${styles.readingButton} ${
                  isReading ? styles.stopButton : styles.startButton
                }`}
              >
                {isReading ? "■" : "▶"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
