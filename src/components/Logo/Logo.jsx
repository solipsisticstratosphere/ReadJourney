import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

const Logo = () => {
  return (
    <Link to="/recommended" className={styles.logo}>
      <div className={styles.logoIcon}>
        <svg className={styles.logosvg} width="42" height="17">
          <use href="/sprite.svg#logo" />
        </svg>
      </div>
      <span className={styles.logoText}>READ JOURNEY</span>
    </Link>
  );
};

export default Logo;
