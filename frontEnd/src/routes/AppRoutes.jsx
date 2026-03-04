import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOtp from "../pages/VerifyOtp";
import ForgotPassword from "../pages/ForgotPassword";
import ResetVerifyOtp from "../pages/ResetVerifyOtp";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Feed from "../pages/Feed";
import AddTask from "../pages/AddTasks";
import MyTasks from "../pages/MyTasks";
import TaskDetail from "../pages/TaskDetail";
import AppLayout from "../layouts/AppLayout";

const AppRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    const interval = setInterval(checkAuth, 100);
    window.addEventListener("storage", checkAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Landing />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Forgot Password Routes - no auth needed */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-verify-otp" element={<ResetVerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/task/:id" element={<TaskDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
