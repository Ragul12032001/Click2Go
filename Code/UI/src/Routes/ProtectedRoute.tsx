import React, { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  authenticated: boolean;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ authenticated }) => {
  return authenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
