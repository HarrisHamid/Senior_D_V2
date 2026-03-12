import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import RouteLoadingScreen from "./RouteLoadingScreen";

type RoleRouteProps = {
  allowedRoles: UserRole[];
  redirectTo?: string;
};

const RoleRoute = ({
  allowedRoles,
  redirectTo = "/dashboard",
}: RoleRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
