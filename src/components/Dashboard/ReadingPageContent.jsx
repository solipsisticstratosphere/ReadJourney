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

  const safeTotalPagesRead =
    typeof totalPagesRead === "number" && !isNaN(totalPagesRead)
      ? totalPagesRead
      : 0;

  const safePercentageRead =
    typeof percentageRead === "number" && !isNaN(percentageRead)
      ? Math.round(percentageRead)
      : 0;

  const safeCircumference =
    typeof circumference === "number" && !isNaN(circumference)
      ? circumference
      : 502;

  const safeStrokeDashoffset =
    typeof strokeDashoffset === "number" && !isNaN(strokeDashoffset)
      ? strokeDashoffset
      : safeCircumference;

  const displayPercentage =
    isReadingActive && safeTotalPagesRead === 0
      ? "0%"
      : `${safePercentageRead}%`;

  const displayPagesRead =
    isReadingActive && safeTotalPagesRead === 0
      ? "Reading session started"
      : `${safeTotalPagesRead} pages read`;

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
                    strokeDasharray={safeCircumference}
                    strokeDashoffset={safeStrokeDashoffset}
                    style={{
                      transition: "stroke-dashoffset 0.5s ease-in-out",
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                    }}
                  />
                </svg>
                <div className={styles.progressContent}>
                  <div className={styles.percentage}>{displayPercentage}</div>
                  <div className={styles.secondaryProgress}>
                    <span className={styles.pagesRead}>{displayPagesRead}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.diaryContent}>
              {Array.isArray(processedEntriesWithDateFlag)
                ? processedEntriesWithDateFlag.map((dateEntry, index) => (
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
                                  index ===
                                  processedEntriesWithDateFlag.length - 1
                                    ? "red"
                                    : "white",
                              }}
                            >
                              <use href="/sprite.svg#square" />
                            </svg>

                            {dateEntry?.date || "Unknown date"}
                          </div>
                          <div className={styles.pageCount}>
                            {typeof dateEntry?.totalDatePages === "number" &&
                            !isNaN(dateEntry.totalDatePages)
                              ? dateEntry.totalDatePages
                              : 0}{" "}
                            pages
                          </div>
                        </div>
                      </div>

                      {Array.isArray(dateEntry?.entries)
                        ? dateEntry.entries.map((entry, entryIndex) => {
                            // Ensure entry values are valid numbers
                            const entryPercentage =
                              typeof entry?.percentage === "number" &&
                              !isNaN(entry.percentage)
                                ? entry.percentage
                                : 0;

                            const entryTime =
                              typeof entry?.time === "number" &&
                              !isNaN(entry.time)
                                ? entry.time
                                : 0;

                            const entryPagesPerHour =
                              typeof entry?.pagesPerHour === "number" &&
                              !isNaN(entry.pagesPerHour)
                                ? entry.pagesPerHour
                                : 0;

                            return (
                              <div
                                key={entryIndex}
                                className={styles.detailsRow}
                              >
                                <div className={styles.progressBar}>
                                  <div
                                    className={styles.progressFill}
                                    style={{ width: `${entryPercentage}%` }}
                                  ></div>
                                </div>
                                <div className={styles.percentage}>
                                  {entryPercentage}%
                                  <div className={styles.readingTime}>
                                    {entryTime} minutes
                                  </div>
                                </div>
                                <div className={styles.imgAndButton}>
                                  <div className={styles.readingSpeed}>
                                    <svg className={styles.readingSpeedSvg}>
                                      <use href="/sprite.svg#trend" />
                                    </svg>
                                    {entryPagesPerHour} pages per hour
                                  </div>
                                  <button
                                    className={styles.deleteButton}
                                    onClick={() =>
                                      entry?._id &&
                                      handleDeleteSession(entry._id)
                                    }
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
                            );
                          })
                        : null}
                    </div>
                  ))
                : null}
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
