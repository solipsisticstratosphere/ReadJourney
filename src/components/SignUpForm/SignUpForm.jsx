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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  const onSubmit = async (data) => {
    try {
      // Use registerUser (from Redux) not register
      const resultAction = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate("/recommended");
      }
    } catch (error) {
      // Error is handled by the redux slice
    }
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
          <div className={styles.formField}>
            <div className={styles.inputContainer}>
              <span className={styles.innerLabel}>Name:</span>
              <input
                type="text"
                {...registerField("name")}
                placeholder="Ilona Ratushniak"
                className={styles.input}
              />
            </div>
            {errors.name && (
              <p className={styles.error}>{errors.name.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <div className={styles.inputContainer}>
              <span className={styles.innerLabel}>Mail:</span>
              <input
                type="email"
                {...registerField("email")}
                placeholder="Your@email.com"
                className={styles.input}
              />
            </div>
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <div className={styles.inputContainer}>
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
                className={styles.showPasswordBtn}
              >
                <svg className={styles.eyesvg} width="42" height="17">
                  <use
                    href={`/sprite.svg#${
                      showPassword ? "openeye" : "closedeye"
                    }`}
                  />
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
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
