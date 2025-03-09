import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";

import styles from "./Header.module.css";
import Logo from "../Logo/Logo";
import { useEffect, useRef, useState } from "react";

const Header = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector(selectUser);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Logo />

        <nav className={styles.desktopNav}>
          <UserNav />
        </nav>

        <div className={styles.userBar}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <span className={styles.userInitial}>
                {user.name ? user.name.charAt(0) : "U"}
              </span>
            </div>
            <span className={styles.userName}>{user.name}</span>
          </div>
          <button className={styles.logoutButton} onClick={onLogout}>
            Log out
          </button>

          <button
            className={styles.burgerButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg className={styles.logosvg} width="42" height="17">
              <use href="/sprite.svg#burger" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.menuOverlay}>
          <div ref={menuRef} className={styles.mobileMenu}>
            <div className={styles.mobileMenuHeader}>
              <button
                className={styles.closeButton}
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.mobileNavContainer}>
              <NavLink
                to="/recommended"
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${
                    isActive ? styles.activeMobileNavLink : ""
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/library"
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${
                    isActive ? styles.activeMobileNavLink : ""
                  }`
                }
              >
                My library
              </NavLink>
            </div>

            <div className={styles.mobileFooter}>
              <button className={styles.mobileLogoutButton} onClick={onLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const UserNav = () => {
  return (
    <ul className={styles.navList}>
      <li className={styles.navItem}>
        <NavLink
          to="/recommended"
          className={({ isActive }) =>
            isActive ? styles.activeNavLink : styles.navLink
          }
        >
          Home
        </NavLink>
      </li>
      <li className={styles.navItem}>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            isActive ? styles.activeNavLink : styles.navLink
          }
        >
          My library
        </NavLink>
      </li>
    </ul>
  );
};

export default Header;
