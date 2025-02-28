import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  addBookToLibraryAsync,
  loadLimitedRecommendedBooks,
  startReadingSessionAsync,
  stopReadingSessionAsync,
  loadCurrentBookAsync,
} from "../../redux/books/operations";
import {
  selectLimitedRecommendedBooks,
  selectLimitedRecommendedBooksLoading,
  selectCurrentBook,
  selectIsReadingActive,
} from "../../redux/books/selectors";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./Dashboard.module.css";
import RecommendedBooks from "../RecommendedBooks/RecommendedBooks";
import smallBooks from "../../assets/images/smallBooks.png";
import SuccessModal from "../ModalSuccess/ModalSuccess";
import { addBookSchema, readingPageSchema } from "../../utils/validations";

const Dashboard = ({ page, onFilterSubmit, filters, bookId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get limited recommendations for library
  const limitedRecommendedBooks = useSelector(selectLimitedRecommendedBooks);
  const isLoadingLimitedRecommended = useSelector(
    selectLimitedRecommendedBooksLoading
  );

  // Reading page specific selectors
  const currentBook = useSelector(selectCurrentBook);
  const isReadingActive = useSelector(selectIsReadingActive);

  // Load limited recommendations when component mounts for library page
  useEffect(() => {
    if (page === "library") {
      dispatch(loadLimitedRecommendedBooks());
    }
    if (page === "reading" && bookId) {
      dispatch(loadCurrentBookAsync(bookId));
    }
  }, [dispatch, page, bookId]);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // "success" or "error"

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedBook, setAddedBook] = useState(null);

  // Define schema based on page
  const getFormSchema = () => {
    switch (page) {
      case "library":
        return addBookSchema;
      case "reading":
        return readingPageSchema;
      case "recommended":
      default:
        return {};
    }
  };

  // Setup form with react-hook-form
  const {
    register,
    handleSubmit: processSubmit,
    formState: { errors, dirtyFields, isSubmitted },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(getFormSchema()),
    mode: "onChange",
    defaultValues:
      page === "recommended"
        ? {
            title: filters?.title || "",
            author: filters?.author || "",
          }
        : page === "reading"
        ? {
            currentPage: currentBook?.currentPage || 0,
          }
        : {
            title: "",
            author: "",
            pages: "",
          },
  });

  // Update form values when currentBook changes
  useEffect(() => {
    if (page === "reading" && currentBook) {
      setValue("currentPage", currentBook.currentPage || 0);
    }
  }, [currentBook, setValue, page]);

  // Get input container class based on validation state
  const getInputContainerClass = (fieldName) => {
    if (dirtyFields[fieldName] || isSubmitted) {
      if (errors[fieldName]) {
        return styles.inputContainerError;
      } else {
        return styles.inputContainerSuccess;
      }
    }
    return styles.inputContainer;
  };

  // Form submission handler
  const onSubmit = async (data) => {
    if (page === "recommended") {
      onFilterSubmit(data);
      return;
    }

    if (page === "reading") {
      try {
        // Toggle reading session
        if (isReadingActive) {
          await dispatch(
            stopReadingSessionAsync({
              bookId,
              currentPage: parseInt(data.currentPage),
            })
          ).unwrap();

          setNotificationMessage("Reading session stopped successfully");
          setNotificationType("success");
        } else {
          await dispatch(
            startReadingSessionAsync({
              bookId,
              startPage: parseInt(data.currentPage),
            })
          ).unwrap();

          setNotificationMessage("Reading session started successfully");
          setNotificationType("success");
        }
        setShowNotification(true);
      } catch (error) {
        setNotificationMessage(error || "Failed to update reading session");
        setNotificationType("error");
        setShowNotification(true);
      }
      return;
    }

    try {
      // Send request to add book to library
      const bookData = {
        title: data.title,
        author: data.author,
        totalPages: parseInt(data.pages),
      };

      const result = await dispatch(addBookToLibraryAsync(bookData)).unwrap();

      // Show success modal
      setAddedBook(result);
      setShowSuccessModal(true);

      // Reset form
      reset();
    } catch (error) {
      // Show error notification
      setNotificationMessage(error || "Failed to add book to library");
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  const onError = (errors) => {
    // Show validation error notification
    const errorMessages = Object.values(errors)
      .map((err) => err.message)
      .join(", ");
    setNotificationMessage(errorMessages);
    setNotificationType("error");
    setShowNotification(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleBookClick = (book) => {
    console.log("Book clicked:", book);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Function to show status message
  const getStatusMessage = (fieldName) => {
    if ((dirtyFields[fieldName] || isSubmitted) && errors[fieldName]) {
      return <span className={styles.error}>{errors[fieldName].message}</span>;
    }
    return null;
  };

  return (
    <div className={styles.dashboard}>
      {page === "recommended" && (
        <>
          <div className={styles.filtersSection}>
            <h2 className={styles.sectionTitle}>Filters:</h2>
            <form
              className={styles.filtersForm}
              onSubmit={processSubmit(onSubmit)}
            >
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <span className={styles.innerLabel}>Book title:</span>
                  <div className={getInputContainerClass("title")}>
                    <input
                      type="text"
                      id="bookTitle"
                      className={styles.input}
                      placeholder="Enter text"
                      {...register("title")}
                    />
                    {(dirtyFields.title || isSubmitted) && (
                      <div className={styles.statusIcon}>
                        {errors.title ? (
                          <svg width="20" height="20">
                            <use href="/sprite.svg#error-icon" />
                          </svg>
                        ) : (
                          <svg width="20" height="20">
                            <use href="/sprite.svg#success-icon" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusMessage("title")}
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <span className={styles.innerLabel}>The author:</span>
                  <div className={getInputContainerClass("author")}>
                    <input
                      type="text"
                      id="author"
                      className={styles.input}
                      placeholder="Enter text"
                      {...register("author")}
                    />
                    {(dirtyFields.author || isSubmitted) && (
                      <div className={styles.statusIcon}>
                        {errors.author ? (
                          <svg width="20" height="20">
                            <use href="/sprite.svg#error-icon" />
                          </svg>
                        ) : (
                          <svg width="20" height="20">
                            <use href="/sprite.svg#success-icon" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusMessage("author")}
              </div>

              <button type="submit" className={styles.applyButton}>
                To apply
              </button>
            </form>
          </div>

          <div className={styles.startWorkout}>
            <h2 className={styles.sectionTitleSecond}>Start your workout</h2>
            <div className={styles.steps}>
              <div className={styles.workoutStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <p>
                    Create a personal library:{" "}
                    <span className={styles.stepHighlight}>
                      add the books you intend to read to it.
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.workoutStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <p>
                    Create your first workout:{" "}
                    <span className={styles.stepHighlight}>
                      define a goal, choose a period, start training.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <Link to="/library" className={styles.libraryLink}>
              My library
              <svg className={styles.arrowsvg} width="24" height="24">
                <use href="/sprite.svg#arrow" />
              </svg>
            </Link>
          </div>

          <div className={styles.quoteSection}>
            <div className={styles.quoteIcon}>
              <img src={smallBooks} className={styles.quoteImage} alt="Books" />
            </div>
            <p className={styles.quote}>
              "Books are <span className={styles.highlight}>windows</span> to
              the world, and reading is a journey into the unknown."
            </p>
          </div>
        </>
      )}

      {page === "library" && (
        <>
          <form
            className={styles.filtersFormLibraryView}
            onSubmit={processSubmit(onSubmit, onError)}
          >
            <h2 className={styles.sectionTitle}>Create your library:</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <span className={styles.innerLabel}>Book title:</span>
                <div className={getInputContainerClass("title")}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Book title"
                    {...register("title")}
                  />
                  {(dirtyFields.title || isSubmitted) && (
                    <div className={styles.statusIcon}>
                      {errors.title ? (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#error-icon" />
                        </svg>
                      ) : (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#success-icon" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {getStatusMessage("title")}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <span className={styles.innerLabel}>The author:</span>
                <div className={getInputContainerClass("author")}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Author name"
                    {...register("author")}
                  />
                  {(dirtyFields.author || isSubmitted) && (
                    <div className={styles.statusIcon}>
                      {errors.author ? (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#error-icon" />
                        </svg>
                      ) : (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#success-icon" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {getStatusMessage("author")}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <span className={styles.innerLabel}>Number of pages:</span>
                <div className={getInputContainerClass("pages")}>
                  <input
                    type="text"
                    className={styles.input}
                    {...register("pages")}
                    onKeyPress={(e) => {
                      // Allow only digits and control keys
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight"
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {(dirtyFields.pages || isSubmitted) && (
                    <div className={styles.statusIcon}>
                      {errors.pages ? (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#error-icon" />
                        </svg>
                      ) : (
                        <svg width="20" height="20">
                          <use href="/sprite.svg#success-icon" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {getStatusMessage("pages")}
            </div>

            <button type="submit" className={styles.applyButton}>
              Add book
            </button>
          </form>

          <div className={styles.recommendedSection}>
            <h2 className={styles.sectionTitleSecondLibrary}>
              Recommended books
            </h2>
            <RecommendedBooks
              showLimited={true}
              books={limitedRecommendedBooks}
              isLoading={isLoadingLimitedRecommended}
              onBookClick={handleBookClick}
              isLibraryView={true}
            />
            <Link to="/recommended" className={styles.libraryLink}>
              Home
              <svg className={styles.arrowsvg} width="24" height="24">
                <use href="/sprite.svg#arrow" />
              </svg>
            </Link>
          </div>
        </>
      )}

      {page === "reading" && currentBook && (
        <div className={styles.readingDashboard}>
          <h2 className={styles.sectionTitle}>My reading</h2>

          <div className={styles.bookDetails}>
            <div className={styles.bookCover}>
              {currentBook.coverImage ? (
                <img
                  src={currentBook.coverImage}
                  alt={`${currentBook.title} cover`}
                  className={styles.coverImage}
                />
              ) : (
                <div className={styles.noCover}>
                  <span className={styles.coverTitle}>{currentBook.title}</span>
                  <span className={styles.coverAuthor}>
                    {currentBook.author}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.bookInfo}>
              <h3 className={styles.bookTitle}>{currentBook.title}</h3>
              <p className={styles.bookAuthor}>{currentBook.author}</p>
            </div>
          </div>

          <form
            className={styles.readingForm}
            onSubmit={processSubmit(onSubmit, onError)}
          >
            <div className={styles.startPage}>
              <span className={styles.label}>Start page:</span>
              <div className={getInputContainerClass("currentPage")}>
                <input
                  type="number"
                  className={styles.input}
                  min="1"
                  max={currentBook.totalPages || 1000}
                  placeholder="Page number"
                  {...register("currentPage")}
                  onKeyPress={(e) => {
                    // Allow only digits and control keys
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {(dirtyFields.currentPage || isSubmitted) && (
                  <div className={styles.statusIcon}>
                    {errors.currentPage ? (
                      <svg width="20" height="20">
                        <use href="/sprite.svg#error-icon" />
                      </svg>
                    ) : (
                      <svg width="20" height="20">
                        <use href="/sprite.svg#success-icon" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {getStatusMessage("currentPage")}
            </div>

            <div className={styles.readingProgress}>
              <div className={styles.progressInfo}>
                <p>
                  <span className={styles.progressLabel}>Progress:</span>
                  <span className={styles.progressValue}>
                    {currentBook.progress.length > 0
                      ? currentBook.progress[currentBook.progress.length - 1]
                          .finishPage || 0
                      : 0}{" "}
                    / {currentBook.totalPages || 0} pages
                  </span>
                </p>
                <progress
                  value={currentBook.currentPage || 0}
                  max={currentBook.totalPages || 100}
                  className={styles.progressBar}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.applyButton} ${
                isReadingActive ? styles.stopButton : styles.startButton
              }`}
            >
              {isReadingActive ? "To stop" : "To start"}
            </button>
          </form>

          <div className={styles.readingInfo}>
            <div className={styles.infoBox}>
              <h4 className={styles.infoTitle}>Progress</h4>
              <p className={styles.infoText}>
                Here you will see when and how much you read.
                <br />
                To record, click on the red button above.
              </p>
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className={`${styles.notification} ${styles[notificationType]}`}>
          <p>{notificationMessage}</p>
          <button
            className={styles.closeNotification}
            onClick={handleNotificationClose}
          >
            ✕
          </button>
        </div>
      )}

      {showSuccessModal && page === "library" && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          handleCloseSuccessModal={handleCloseSuccessModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
