import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(7, "Password must be at least 7 characters")
    .required("Password is required"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(7, "Password must be at least 7 characters")
    .required("Password is required"),
});

export const addBookSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  author: yup.string().required("Author is required"),
  pages: yup
    .number()
    .typeError("Pages must be a number")
    .required("Pages is required")
    .positive("Pages must be positive"),
});
export const readingPageSchema = yup.object().shape({
  currentPage: yup
    .string()
    .required("Current page is required")
    .matches(/^[0-9]+$/, "Page number must be a number")
    .test("currentPage", "Page number must be greater than 0", (value) => {
      return parseInt(value) > 0;
    }),
});
