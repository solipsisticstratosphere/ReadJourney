import { useState } from "react";

import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "../../pages/RegisterPage/RegisterPage";
import LoginPage from "../../pages/LoginPage/LoginPage";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </>
  );
}

export default App;
