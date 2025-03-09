import React from "react";
import styles from "./Dashboard.module.css";

const ReadingPageContent = ({
  currentBook,
  isReadingActive,
  getInputContainerClass,
  register,
  dirtyFields,
  isSubmitted,
  errors,
  processSubmit,
  onSubmit,
  onError,
  isValid,
  hasProgress,
  activeView,
  toggleView,
  totalPagesRead,
  percentageRead,
  radius,
  circumference,
  strokeDashoffset,
  processedEntriesWithDateFlag,
  handleDeleteSession,
  star,
  externalFormControl,
  validateCurrentPage,
}) => {
  if (!currentBook) return null;

  return (
    <div className={styles.readingDashboard}>
      <div className={styles.filtersFormReadingView}>
        <div className={styles.formReading}>
          <span className={styles.sectionTitle}>Start page:</span>
          <div className={styles.inputGroup}>
            <div className={styles.inputField}>
              <div className={getInputContainerClass("currentPage")}>
                <input
                  type="text"
                  className={styles.inputReading}
                  min="1"
                  max={
                    externalFormControl?.totalPages ||
                    currentBook?.totalPages ||
                    1000
                  }
                  {...register("currentPage", {
                    validate: validateCurrentPage,
                  })}
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
          disabled={
            (currentBook?.status === "done" && !isReadingActive) ||
            !isValid ||
            !!errors.currentPage
          }
        >
          {isReadingActive ? "To stop" : "To start"}
        </button>
      </div>

      {hasProgress ? (
        <div className={styles.progressSwitcher}>
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
                  <svg width="20" height="20">
                    <use href="/sprite.svg#statistics" />
                  </svg>
                </button>
              </div>
            </div>
            {activeView === "statistics" && (
              <p className={styles.progressTextNew}>
                Each page, each chapter is a new round of knowledge, a new step
                towards understanding. By rewriting statistics, we create our
                own reading history.
              </p>
            )}
          </div>

          {activeView === "statistics" ? (
            <div className={styles.statisticsContent}>
              <div className={styles.progressCircleContainer}>
                <svg className={styles.progressCircleSvg} viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="80"
                    fill="none"
                    stroke="#2C2C2C"
                    strokeWidth="16"
                  />

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
          ) : (
            <div className={styles.diaryContent}>
              {processedEntriesWithDateFlag.map((dateEntry, index) => (
                <div key={index} className={styles.diaryEntry}>
                  <div className={styles.headerRow}>
                    <div
                      className={styles.entryDate}
                      style={{
                        color:
                          processedEntriesWithDateFlag.length === 1 ||
                          index === processedEntriesWithDateFlag.length - 1
                            ? "var(--primary-text-color)"
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
                              index === processedEntriesWithDateFlag.length - 1
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
        </div>
      ) : (
        <div className={styles.progressContainer}>
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
        </div>
      )}
    </div>
  );
};

export default ReadingPageContent;
