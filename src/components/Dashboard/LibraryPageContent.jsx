import { Link } from "react-router-dom";
import RecommendedBooks from "../RecommendedBooks/RecommendedBooks";
import styles from "./Dashboard.module.css";

const LibraryPageContent = ({
  getInputContainerClass,
  getStatusMessage,
  register,
  dirtyFields,
  isSubmitted,
  errors,
  processSubmit,
  onSubmit,
  onError,
  limitedRecommendedBooks,
  isLoadingLimitedRecommended,
  handleBookClick,
}) => {
  return (
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
        <h2 className={styles.sectionTitleSecondLibrary}>Recommended books</h2>
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
  );
};

export default LibraryPageContent;
