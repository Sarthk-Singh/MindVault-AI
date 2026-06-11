import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute: React.FC = () => {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
