import React from "react";
import NotFoundPage from "../pages/NotFoundPage";

export default function ProtectedRoute({ isLoggedIn, authLoading, children }) {
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <NotFoundPage />;
  }

  return children;
}
