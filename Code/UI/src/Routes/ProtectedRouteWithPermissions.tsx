import React, { FC } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteWithPermissionsProps {
  permissions: string[];
  requiredPermission: string;
  children: JSX.Element;
}

const ProtectedRouteWithPermissions: FC<ProtectedRouteWithPermissionsProps> = ({ permissions, requiredPermission, children }) => {
  return permissions.includes(requiredPermission) ? children : <Navigate to="/dashboard" />;
};

export default ProtectedRouteWithPermissions;
