import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hasAuthToken } from "../api";

export default function ProtectedRoute({ isLoggedIn, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn && !hasAuthToken()) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn && !hasAuthToken()) {
    return null;
  }

  return children;
}
