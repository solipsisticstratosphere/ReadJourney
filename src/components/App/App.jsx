import { useEffect, Suspense, lazy } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsRefreshing, selectToken } from "../../redux/auth/selectors";
import { PrivateRoute } from "../PrivateRoute";
import { refreshUser } from "../../redux/auth/operations";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader/Loader";

// Используем React.lazy для компонентов
const Layout = lazy(() => import("../Layout/Layout"));
const RegisterPage = lazy(() =>
  import("../../pages/RegisterPage/RegisterPage")
);
const LoginPage = lazy(() => import("../../pages/LoginPage/LoginPage"));
const RecommendedPage = lazy(() =>
  import("../../pages/RecommendPage/RecommendPage")
);
const MyLibraryPage = lazy(() =>
  import("../../pages/MyLibraryPage/MyLibraryPage")
);
const ReadingPage = lazy(() => import("../../pages/ReadingPage/ReadingPage"));
const NotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage/NotFoundPage")
);

function App() {
  const dispatch = useDispatch();
  const isRefreshing = useSelector(selectIsRefreshing);
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      dispatch(refreshUser());
    }
  }, [dispatch, token]);

  if (isRefreshing) {
    return <Loader />;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route index element={<Navigate to="/register" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <Suspense fallback={<Loader />}>
                <Layout />
              </Suspense>
            }
          >
            <Route
              path="/recommended"
              element={
                <PrivateRoute
                  component={
                    <Suspense fallback={<Loader />}>
                      <RecommendedPage />
                    </Suspense>
                  }
                  redirectTo="/login"
                />
              }
            />
            <Route
              path="/library"
              element={
                <PrivateRoute
                  component={
                    <Suspense fallback={<Loader />}>
                      <MyLibraryPage />
                    </Suspense>
                  }
                  redirectTo="/login"
                />
              }
            />
            <Route
              path="/reading/:bookId"
              element={
                <PrivateRoute
                  component={
                    <Suspense fallback={<Loader />}>
                      <ReadingPage />
                    </Suspense>
                  }
                  redirectTo="/login"
                />
              }
            />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
