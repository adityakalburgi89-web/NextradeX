import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`nav-link hover:text-primary transition-colors duration-200 ${isActive ? "text-primary active" : ""}`}
    >
      {children}
    </Link>
  );
}
