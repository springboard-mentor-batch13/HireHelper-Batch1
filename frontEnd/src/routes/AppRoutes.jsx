import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOtp from "../pages/VerifyOtp";
import Dashboard from "../pages/Dashboard";
import Feed from "../pages/Feed";
import AppLayout from "../layouts/AppLayout";
 
const AppRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
 
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
 
    // Check auth state periodically
    const interval = setInterval(checkAuth, 100);
   
    // Also listen to storage events
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
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Landing />
        }
      />
 
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Register />
        }
      />
      <Route path="/verify-otp" element={<VerifyOtp />} />
 
      <Route
        element={
          isLoggedIn ? <AppLayout /> : <Navigate to="/login" />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
      </Route>
 
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
 
export default AppRoutes;