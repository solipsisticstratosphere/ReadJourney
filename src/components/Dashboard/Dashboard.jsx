import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  addBookToLibraryAsync,
  loadLimitedRecommendedBooks,
  startReadingSessionAsync,
  stopReadingSessionAsync,
  loadCurrentBookAsync,
  deleteReadingSession,
  loadBookForReadingAsync,
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
import star from "../../assets/images/star.png";
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
  const [activeView, setActiveView] = useState("statistics");

  const totalPagesRead = currentBook?.progress
    ? currentBook.progress.reduce(
        (total, session) =>
          total + (session.finishPage - session.startPage + 1),
        0
      )
    : 0;

  // Calculate total pages in the book
  const totalPages = currentBook?.totalPages || 0;

  // Calculate percentage of book read
  const calculatePercentage = () => {
    // If reading is active and no previous progress, show 100%
    if (isReadingActive && totalPagesRead === 0) {
      return 100;
    }

    // Ensure we don't divide by zero and handle NaN
    if (totalPages > 0) {
      const percentage = Math.min((totalPagesRead / totalPages) * 100, 100);
      return isNaN(percentage) ? 0 : Number(percentage.toFixed(2));
    }

    return 0;
  };

  const percentageRead = calculatePercentage();

  // Safely calculate SVG circle properties
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(percentageRead)
    ? circumference
    : circumference - (percentageRead / 100) * circumference;
  // Load limited recommendations when component mounts for library page

  const processProgressData = () => {
    if (!currentBook || !currentBook.progress) return [];

    // First, process individual entries
    const processedEntries = currentBook.progress
      .filter((entry) => entry.finishReading) // Только завершенные сессии
      .map((entry) => {
        const readingTime = Math.round(
          (new Date(entry.finishReading) - new Date(entry.startReading)) / 60000
        );
        const pageCount = entry.finishPage - entry.startPage;
        const readingDate = new Date(entry.finishReading)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, ".");

        return {
          ...entry,
          date: readingDate,
          pages: pageCount,
          percentage: Number(
            ((pageCount / currentBook.totalPages) * 100).toFixed(2)
          ),
          time: readingTime,
          pagesPerHour: Math.round(pageCount / (readingTime / 60) || 0),
        };
      })
      .sort((a, b) => {
        const [day1, month1, year1] = a.date.split(".");
        const [day2, month2, year2] = b.date.split(".");
        return (
          new Date(`${year2}-${month2}-${day2}`) -
          new Date(`${year1}-${month1}-${day1}`)
        );
      });

    // Group entries by date and calculate total pages for each date
    const processedEntriesWithTotals = processedEntries.reduce((acc, entry) => {
      // Find if this date already exists in the accumulator
      const existingDateEntry = acc.find((e) => e.date === entry.date);

      if (existingDateEntry) {
        // If date exists, update its total pages
        existingDateEntry.totalDatePages += entry.pages;
        existingDateEntry.entries.push(entry);
      } else {
        // If date doesn't exist, create a new entry
        acc.push({
          ...entry,
          totalDatePages: entry.pages,
          entries: [entry],
        });
      }

      return acc;
    }, []);

    // Sort the final processed entries
    return processedEntriesWithTotals.sort((a, b) => {
      const [day1, month1, year1] = a.date.split(".");
      const [day2, month2, year2] = b.date.split(".");
      return (
        new Date(`${year2}-${month2}-${day2}`) -
        new Date(`${year1}-${month1}-${day1}`)
      );
    });
  };

  const processedProgressData = processProgressData();
  const processedEntriesWithDateFlag = processedProgressData.map(
    (entry, index, array) => ({
      ...entry,
      shouldShowDate: true, // Always show date for grouped entries
    })
  );
  const handleDeleteSession = (readingId) => {
    if (currentBook && currentBook._id) {
      // Optimistically update the UI
      const updatedProgress = currentBook.progress.filter(
        (session) => session._id !== readingId
      );

      // Dispatch the delete action
      dispatch(
        deleteReadingSession({
          bookId: currentBook._id,
          readingId: readingId,
        })
      );

      // Update the local state immediately
      dispatch(
        loadBookForReadingAsync.fulfilled({
          ...currentBook,
          progress: updatedProgress,
        })
      );
    }
  };
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
  const toggleView = (view) => {
    setActiveView(view);
  };
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedBook, setAddedBook] = useState(null);
  let hasProgress = false;
  if (page === "reading" && currentBook) {
    hasProgress = currentBook.progress
      ? currentBook.progress.length > 0
      : false;
  }
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
            currentPage:
              currentBook.progress?.length > 0
                ? currentBook.progress[currentBook.progress.length - 1]
                    .finishPage
                : 1,
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
      setValue(
        "currentPage",
        currentBook.progress?.length > 0
          ? currentBook.progress[currentBook.progress.length - 1].finishPage
          : 1
      );
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
          <div className={styles.filtersFormReadingView}>
            <span className={styles.sectionTitle}>Start page:</span>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <div className={getInputContainerClass("currentPage")}>
                  <input
                    type="text"
                    className={styles.inputReading}
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
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.readingButton} ${
              isReadingActive ? styles.stopButton : styles.startButton
            }`}
            onClick={processSubmit(onSubmit, onError)}
          >
            {isReadingActive ? "To stop" : "To start"}
          </button>
          {hasProgress ? (
            // Если есть прогресс, показываем режимы Statistics и Diary
            <>
              <div className={styles.progressSection}>
                <div className={styles.viewToggle}>
                  <h4 className={styles.progressTitle}>
                    {activeView === "statistics" ? "Statistics" : "Diary"}
                  </h4>
                  <div className={styles.viewButtons}>
                    <button
                      className={`${styles.toggleButton} ${
                        activeView === "diary" ? styles.active : ""
                      }`}
                      onClick={() => toggleView("diary")}
                    >
                      {/* SVG иконка для Diary */}
                      <svg width="20" height="20">
                        <use href="/sprite.svg#diary" />
                      </svg>
                    </button>
                    <button
                      className={`${styles.toggleButton} ${
                        activeView === "statistics" ? styles.active : ""
                      }`}
                      onClick={() => toggleView("statistics")}
                    >
                      {/* SVG иконка для Statistics */}
                      <svg width="20" height="20">
                        <use href="/sprite.svg#statistics" />
                      </svg>
                    </button>
                  </div>
                </div>
                {activeView === "statistics" && (
                  <p className={styles.progressTextNew}>
                    Each page, each chapter is a new round of knowledge, a new
                    step towards understanding. By rewriting statistics, we
                    create our own reading history.
                  </p>
                )}

                {/* Переключатель между режимами */}
              </div>

              {/* Содержимое в зависимости от выбранного режима */}
              {activeView === "statistics" && (
                <div className={styles.statisticsContent}>
                  <div className={styles.progressCircleContainer}>
                    <svg
                      className={styles.progressCircleSvg}
                      viewBox="0 0 180 180"
                    >
                      {/* Background circle */}
                      <circle
                        cx="90"
                        cy="90"
                        r="80"
                        fill="none"
                        stroke="#2C2C2C"
                        strokeWidth="16"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="90"
                        cy="90"
                        r="80"
                        fill="none"
                        stroke="#3CBF3C"
                        strokeWidth="16"
                        strokeDasharray={circumference.toString()}
                        strokeDashoffset={strokeDashoffset.toString()}
                        style={{
                          transition: "stroke-dashoffset 0.5s ease-in-out",
                          transform: "rotate(-90deg)",
                          transformOrigin: "50% 50%",
                        }}
                      />
                    </svg>
                    <div className={styles.progressContent}>
                      <div className={styles.percentage}>
                        {isReadingActive && totalPagesRead === 0
                          ? "100%"
                          : `${percentageRead || 0}%`}
                      </div>
                      <div className={styles.secondaryProgress}>
                        <span className={styles.pagesRead}>
                          {isReadingActive && totalPagesRead === 0
                            ? "Reading session started"
                            : `${totalPagesRead || 0} pages read`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === "diary" && (
                <div className={styles.diaryContent}>
                  {processedEntriesWithDateFlag.map((dateEntry, index) => (
                    <div key={index} className={styles.diaryEntry}>
                      <div className={styles.headerRow}>
                        <div
                          className={styles.entryDate}
                          style={{
                            color:
                              index === processedEntriesWithDateFlag.length - 1
                                ? ""
                                : "var(--primary-text-color)",
                          }}
                        >
                          <div className={styles.entryDateText}>
                            <svg
                              className={styles.deleteIcon}
                              width="20"
                              height="20"
                              style={{
                                fill:
                                  index ===
                                  processedEntriesWithDateFlag.length - 1
                                    ? "red"
                                    : "white",
                              }}
                            >
                              <use href="/sprite.svg#square" />
                            </svg>

                            {dateEntry.date}
                          </div>
                          <div className={styles.pageCount}>
                            {dateEntry.totalDatePages} pages
                          </div>
                        </div>
                      </div>

                      {dateEntry.entries.map((entry, entryIndex) => (
                        <div key={entryIndex} className={styles.detailsRow}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${entry.percentage}%` }}
                            ></div>
                          </div>
                          <div className={styles.percentage}>
                            {entry.percentage}%
                            <div className={styles.readingTime}>
                              {entry.time} minutes
                            </div>
                          </div>
                          <div className={styles.imgAndButton}>
                            <div className={styles.readingSpeed}>
                              <svg className={styles.readingSpeedSvg}>
                                <use href="/sprite.svg#trend" />
                              </svg>
                              {entry.pagesPerHour} pages per hour
                            </div>
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDeleteSession(entry._id)}
                            >
                              <div>
                                <svg
                                  className={styles.deleteIcon}
                                  width="20"
                                  height="20"
                                >
                                  <use href="/sprite.svg#trash-bin" />
                                </svg>
                              </div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Если прогресса нет, показываем базовую информацию
            <>
              <div className={styles.progressSection}>
                <h4 className={styles.progressTitle}>Progress</h4>
                <p className={styles.progressText}>
                  Here you will see when and how much you read.
                  <br />
                  To record, click on the red button above.
                </p>
              </div>
              <div className={styles.starContainer}>
                <div className={styles.starIconWrapper}>
                  <img src={star} className={styles.starImage} alt="Books" />
                </div>
              </div>
            </>
          )}
          {/* Звездочка отображается в любом случае */}
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
