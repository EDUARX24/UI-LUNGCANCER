import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface PublicOnlyRouteProps {
  children: ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
        <span className="text-xs font-mono text-[#a1a1aa]">
          Comprobando estado de sesión...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/session" replace />;
  }

  return <>{children}</>;
}
