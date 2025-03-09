import React from "react";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";

const RecommendedPageContent = ({
  getInputContainerClass,
  getStatusMessage,
  register,
  dirtyFields,
  isSubmitted,
  errors,
  processSubmit,
  onSubmit,
  smallBooks,
}) => {
  return (
    <>
      <div className={styles.filtersSection}>
        <h2 className={styles.sectionTitle}>Filters:</h2>
        <form className={styles.filtersForm} onSubmit={processSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <div className={styles.inputField}>
              <span className={styles.innerLabel}>Book title:</span>
              <div className={getInputContainerClass("title")}>
                <input
                  type="text"
                  id="bookTitle"
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
                  id="author"
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
          "Books are <span className={styles.highlight}>windows</span> to the
          world, and reading is a journey into the unknown."
        </p>
      </div>
    </>
  );
};

export default RecommendedPageContent;
