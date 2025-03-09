import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validations";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../SignUpForm/SignUpForm.module.css";
import { useEffect, useState } from "react";
import Iphone from "../../assets/images/iPhone.png";
import { useDispatch, useSelector } from "react-redux";
import { selectError, selectIsLoading } from "../../redux/auth/selectors";
import { login } from "../../redux/auth/operations";
const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
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
      const resultAction = await dispatch(login(data));
      if (login.fulfilled.match(resultAction)) {
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
            READ JOURNEY
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
              <span className={styles.innerLabel}>Mail:</span>
              <input
                type="email"
                {...register("email")}
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
                {...register("password")}
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
              {isLoading ? "Loading..." : "Log in"}
            </button>
            <div className={styles.loginLink}>
              <a href="/register" className={styles.linkText}>
                Don`t have an account?
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

export default SignInForm;
