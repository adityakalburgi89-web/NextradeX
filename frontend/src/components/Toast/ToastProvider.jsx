import React, { createContext, useContext, useState, useCallback } from "react";

export const ToastContext = createContext(null);

const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, type, message, createdAt: Date.now() }];
      return next.slice(-MAX_TOASTS);
    });
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const toast = {
    success: useCallback((msg) => addToast("success", msg), [addToast]),
    error: useCallback((msg) => addToast("error", msg), [addToast]),
    info: useCallback((msg) => addToast("info", msg), [addToast]),
    warning: useCallback((msg) => addToast("warning", msg), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}