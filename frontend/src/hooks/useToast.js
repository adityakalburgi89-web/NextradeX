import { useContext } from "react";
import { ToastContext } from "../components/Toast/ToastProvider";

export function useToast() {
  const context = useContext(ToastContext);
  return context ? context.toast : null;
}