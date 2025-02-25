import { useEffect } from "react";

import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "../../pages/RegisterPage/RegisterPage";
import LoginPage from "../../pages/LoginPage/LoginPage";
import { useDispatch, useSelector } from "react-redux";
import { selectIsRefreshing, selectToken } from "../../redux/auth/selectors";
import { PrivateRoute } from "../PrivateRoute";
import { refreshUser } from "../../redux/auth/operations";
import Layout from "../Layout/Layout";
import RecommendedPage from "../../pages/RecommendPage/RecommendPage";

function App() {
  const dispatch = useDispatch();
  const isRefreshing = useSelector(selectIsRefreshing);
  const token = useSelector(selectToken);
  useEffect(() => {
    if (token) {
      dispatch(refreshUser());
    }
  }, [dispatch, token]);

  return isRefreshing ? (
    <div>Loading...</div>
  ) : (
    <>
      <Routes>
        <Route index element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route
            path="/recommended"
            element={
              <PrivateRoute
                component={<RecommendedPage />}
                redirectTo="/login"
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </>
  );
}

export default App;
