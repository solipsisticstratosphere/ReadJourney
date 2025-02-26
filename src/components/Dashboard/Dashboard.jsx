import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  addBookToLibraryAsync,
  loadLimitedRecommendedBooks,
} from "../../redux/books/operations";
import {
  selectLimitedRecommendedBooks,
  selectLimitedRecommendedBooksLoading,
} from "../../redux/books/selectors";
import styles from "./Dashboard.module.css";
import RecommendedBooks from "../RecommendedBooks/RecommendedBooks";
import smallBooks from "../../assets/images/smallBooks.png";
import ModalSuccess from "../ModalSuccess/ModalSuccess";
import SuccessModal from "../ModalSuccess/ModalSuccess";

const Dashboard = ({ page, onFilterSubmit, filters }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Получаем ограниченные рекомендации для библиотеки
  const limitedRecommendedBooks = useSelector(selectLimitedRecommendedBooks);
  const isLoadingLimitedRecommended = useSelector(
    selectLimitedRecommendedBooksLoading
  );

  // Загружаем ограниченные рекомендации при монтировании компонента для страницы библиотеки
  useEffect(() => {
    if (page === "library") {
      dispatch(loadLimitedRecommendedBooks());
    }
  }, [dispatch, page]);

  const [formData, setFormData] = useState(
    page === "recommended"
      ? {
          title: filters?.title || "",
          author: filters?.author || "",
        }
      : {
          title: "",
          author: "",
          pages: "",
        }
  );

  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // "success" or "error"

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedBook, setAddedBook] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Book title is required";
    }
    if (!formData.author.trim()) {
      newErrors.author = "Author name is required";
    }
    if (page === "library" && !formData.pages?.trim()) {
      newErrors.pages = "Number of pages is required";
    } else if (
      page === "library" &&
      (isNaN(Number(formData.pages)) || Number(formData.pages) <= 0)
    ) {
      newErrors.pages = "Pages must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on input change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (page === "recommended") {
      onFilterSubmit(formData);
      return;
    }

    if (!validateForm()) return;

    try {
      // Send request to add book to library
      const bookData = {
        title: formData.title,
        author: formData.author,
        totalPages: parseInt(formData.pages),
      };

      const result = await dispatch(addBookToLibraryAsync(bookData)).unwrap();

      // Show success modal
      setAddedBook(result);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        title: "",
        author: "",
        pages: "",
      });
    } catch (error) {
      // Show error notification
      setNotificationMessage(error || "Failed to add book to library");
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleBookClick = (book) => {
    // Можно добавить диспатч для выбора книги или другие действия
    console.log("Book clicked:", book);
  };
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };
  return (
    <div className={styles.dashboard}>
      {page === "recommended" && (
        <>
          <div className={styles.filtersSection}>
            <h2 className={styles.sectionTitle}>Filters:</h2>
            <form className={styles.filtersForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <span className={styles.innerLabel}>Book title:</span>
                <input
                  type="text"
                  id="bookTitle"
                  name="title"
                  className={styles.input}
                  placeholder="Enter text"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <span className={styles.innerLabel}>The author:</span>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className={styles.input}
                  placeholder="Enter text"
                  value={formData.author}
                  onChange={handleInputChange}
                />
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
            onSubmit={handleSubmit}
          >
            <h2 className={styles.sectionTitle}>Create your library:</h2>
            <div className={styles.inputGroup}>
              <span className={styles.innerLabel}>Book title:</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
              />
              {errors.title && (
                <span className={styles.error}>{errors.title}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.innerLabel}>The author:</span>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={styles.input}
              />
              {errors.author && (
                <span className={styles.error}>{errors.author}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.innerLabel}>Number of pages:</span>
              <input
                type="text"
                name="pages"
                value={formData.pages || ""}
                onChange={handleInputChange}
                className={styles.input}
              />
              {errors.pages && (
                <span className={styles.error}>{errors.pages}</span>
              )}
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
              isLibraryView={page === "library"}
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
