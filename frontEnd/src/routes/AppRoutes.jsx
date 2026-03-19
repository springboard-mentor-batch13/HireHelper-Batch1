import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

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
import Requests from "../pages/Requests";
import MyRequests from "../pages/MyRequests";
import Chat from "../pages/Chat";
import AppLayout from "../layouts/AppLayout";
import { api } from "../lib/api";

const AppRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res?.user) {
        setUser(res.user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChanged = () => {
      checkAuth();
    };

    // sync across tabs and after setToken()
    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, [checkAuth]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* ⭐ Public Routes */}
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-verify-otp" element={<ResetVerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ⭐ Protected Routes */}
      <Route
        element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/my-requests" element={<MyRequests />} />

        {/* ⭐ CHAT PAGE */}
        <Route path="/chat/:taskId" element={<Chat />} />
      </Route>

      {/* ⭐ Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;