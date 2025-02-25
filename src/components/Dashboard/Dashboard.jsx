import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";
import smallBooks from "../../assets/images/smallBooks.png";
const Dashboard = ({ page, onFilterSubmit, filters }) => {
  const [formData, setFormData] = useState({
    title: filters?.title || "",
    author: filters?.author || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterSubmit(formData);
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

      {/* Add other dashboard content for different pages here */}
    </div>
  );
};

export default Dashboard;
