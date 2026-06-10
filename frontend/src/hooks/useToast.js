import { useContext } from "react";
import { ToastContext } from "../components/Toast/ToastProvider";

export function useToast() {
  return useContext(ToastContext);
}