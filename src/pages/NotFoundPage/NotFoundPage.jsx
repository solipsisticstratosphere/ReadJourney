import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";
import bookIcon from "../../assets/images/smallBooks.png";

const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoText}>READ JOURNEY</span>
          </div>
        </div>

        <div className={styles.notFoundContent}>
          <div className={styles.iconContainer}>
            <img src={bookIcon} alt="Book icon" className={styles.bookIcon} />
          </div>

          <h1 className={styles.title}>404</h1>
          <p className={styles.message}>Oops! Page not found</p>
          <p className={styles.submessage}>
            The page you are looking for doesn't exist or has been moved
          </p>

          <Link to="/register" className={styles.button}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
