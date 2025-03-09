import { ClipLoader, PulseLoader, BeatLoader } from "react-spinners";
import styles from "./Loader.module.css";

const Loader = ({ type = "clip", color = "#F5F5F5", size = 40 }) => {
  const getLoader = () => {
    switch (type) {
      case "pulse":
        return <PulseLoader color={color} size={size / 2} />;
      case "beat":
        return <BeatLoader color={color} size={size / 2} />;
      case "clip":
      default:
        return <ClipLoader color={color} size={size} />;
    }
  };

  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContainer}>{getLoader()}</div>
    </div>
  );
};

export default Loader;
