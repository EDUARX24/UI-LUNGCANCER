import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roles?.includes("PATIENT")) {
    return <Navigate to="/my-studies" replace />;
  }

  return <Navigate to="/admin" replace />;
}
