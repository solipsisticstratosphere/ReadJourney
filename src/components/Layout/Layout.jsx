import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../Header/Header";
import { logout } from "../../redux/auth/operations";
import { clearUserData } from "../../redux/auth/slice";
import { toast } from "react-toastify";
import styles from "./Layout.module.css";

const Layout = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      // Clear local storage and redux store on successful logout
      localStorage.clear();
      dispatch(clearUserData());
    } catch (error) {
      // Show notification if backend returns an error
      toast.error("Logout failed. Please try again.");
      // Still clear data on the client side
      localStorage.clear();
      dispatch(clearUserData());
    }
  };

  return (
    <div className={styles.layout}>
      <Header onLogout={handleLogout} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
