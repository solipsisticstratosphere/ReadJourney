import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../utils/validations";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SignUpForm.module.css";
import { useEffect, useState } from "react";
import Iphone from "../../assets/images/iPhone.png";
import { useDispatch, useSelector } from "react-redux";
import { selectError, selectIsLoading } from "../../redux/auth/selectors";
import { register as registerUser } from "../../redux/auth/operations";

const SignUpForm = () => {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange", // Validate on change
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Watch password field for validation
  const password = watch("password");
  const passwordIsDirty = dirtyFields.password;
  const passwordIsValid = passwordIsDirty && !errors.password;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate("/recommended");
      }
    } catch (error) {
      // Error is handled by the redux slice
    }
  };

  // Function to determine input container class based on validation state
  const getInputContainerClass = (fieldName) => {
    if (dirtyFields[fieldName]) {
      if (errors[fieldName]) {
        return styles.inputContainerError;
      } else {
        return styles.inputContainerSuccess;
      }
    }
    return styles.inputContainer;
  };

  // Function to show status message
  const getStatusMessage = (fieldName) => {
    if (fieldName === "name") {
      return null;
    }
    if (dirtyFields[fieldName]) {
      if (errors[fieldName]) {
        return (
          <p className={styles.errorMessage}>
            {errors[fieldName].message || "Enter a valid value"}
          </p>
        );
        return <p className={styles.successMessage}>Password is secure</p>;
      }
    }
    return null;
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.formSection}>
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>
            <svg className={styles.logosvg} width="42" height="17">
              <use href="/sprite.svg#logo" />
            </svg>
            <div className={styles.textHeader}>READ JOURNEY</div>
          </div>
        </div>

        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            Expand your <br />
            mind, reading
            <span className={styles.titleSpan}> a book</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Name field */}
          <div className={styles.formField}>
            <div className={getInputContainerClass("name")}>
              <span className={styles.innerLabel}>Name:</span>
              <input
                type="text"
                {...registerField("name")}
                placeholder="Ilona Ratushniak"
                className={styles.input}
              />
              {dirtyFields.name && (
                <div className={styles.statusIcon}>
                  {errors.name ? (
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
            {getStatusMessage("name")}
          </div>

          {/* Email field */}
          <div className={styles.formField}>
            <div className={getInputContainerClass("email")}>
              <span className={styles.innerLabel}>Mail:</span>
              <input
                type="email"
                {...registerField("email")}
                placeholder="Your@email.com"
                className={styles.input}
              />
              {dirtyFields.email && (
                <div className={styles.statusIcon}>
                  {errors.email ? (
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
            {getStatusMessage("email")}
          </div>

          {/* Password field */}
          <div className={styles.formField}>
            <div className={getInputContainerClass("password")}>
              <span className={styles.innerLabel}>Password:</span>
              <input
                type={showPassword ? "text" : "password"}
                {...registerField("password")}
                placeholder="Yourpasswordhere"
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`${styles.showPasswordBtn} ${
                  dirtyFields.password ? styles.showPasswordBtnWithStatus : ""
                }`}
              >
                <svg className={styles.eyesvg} width="42" height="17">
                  <use
                    href={`/sprite.svg#${
                      showPassword ? "openeye" : "closedeye"
                    }`}
                  />
                </svg>
              </button>
              {dirtyFields.password && (
                <div className={styles.statusIcon}>
                  {errors.password ? (
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
            {getStatusMessage("password")}
          </div>

          <div className={styles.buttonText}>
            <button
              type="submit"
              className={styles.registerButton}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Registration"}
            </button>

            <div className={styles.loginLink}>
              <a href="/login" className={styles.linkText}>
                Already have an account?
              </a>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.mobilePreviewSection}>
        <img src={Iphone} alt="" className={styles.mobilePreviewImage} />
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignUpForm;
