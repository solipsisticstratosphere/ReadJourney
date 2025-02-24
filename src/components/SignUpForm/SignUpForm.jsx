import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../utils/validations";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SignUpForm.module.css";
import { useState } from "react";
import Iphone from "../../assets/images/iPhone.png";
const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://your-backend-api/register",
        data
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/recommended");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
                {...register("name")}
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
                {...register("email")}
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
                {...register("password")}
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
            <button type="submit" className={styles.registerButton}>
              Registration
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
