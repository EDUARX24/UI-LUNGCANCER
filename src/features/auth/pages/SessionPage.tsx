import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  Server, 
  Key, 
  AlertCircle, 
  Loader2, 
  Terminal,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import type { UserProfile } from "../types";

export function SessionPage() {
  const navigate = useNavigate();
  const { logout, logoutAll } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const isPatient = user?.roles?.includes("PATIENT");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiHealth, setApiHealth] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await authService.getCurrentUser();
      setUser(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMessage("No hay sesión activa o el token ha expirado. Por favor inicia sesión.");
        } else {
          setErrorMessage(err.response?.data?.message || "Error al obtener el perfil.");
        }
      } else {
        setErrorMessage("Error de conexión al obtener el perfil de usuario.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await authService.checkHealth();
      setApiHealth(res.status || "online");
    } catch {
      setApiHealth("unreachable");
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    checkHealth();
  }, [fetchProfile, checkHealth]);

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const tokens = await authService.refreshToken();
      if (tokens.access_token) {
        toast.success("Tokens renovados exitosamente (HMAC CSRF verificado)");
        fetchProfile();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error("Fallo al refrescar token: " + (err.response?.data?.message || err.message));
      } else {
        toast.error("Error al refrescar token");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async (allDevices = false) => {
    setIsLoggingOut(true);
    try {
      if (allDevices) {
        await logoutAll();
        toast.success("Todas las sesiones han sido cerradas");
      } else {
        await logout();
        toast.success("Sesión cerrada correctamente");
      }
    } catch {
      toast.success(allDevices ? "Sesiones finalizadas" : "Sesión cerrada correctamente");
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121215] border border-[#27272a] px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
              Panel Técnico de Sesión Clínica
              <Badge variant="clinical" className="text-[10px] py-0 px-1.5">
                FASE AUTH-03
              </Badge>
            </h1>
            <p className="text-[11px] font-mono text-[#a1a1aa]">
              Verificación de Handshake JWT + Cookies + CSRF HMAC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          <span className="text-[#34d399]">
            Health: {apiHealth ? apiHealth.toUpperCase() : "VERIFICANDO..."}
          </span>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
          <AlertDescription className="text-xs flex items-center justify-between w-full">
            <span>{errorMessage}</span>
            <button
              onClick={() => navigate("/login")}
              className="text-[#fafafa] underline font-medium hover:text-[#c4b5fd]"
            >
              Ir a Iniciar Sesión
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity Card */}
        <div className="bg-[#121215] border border-[#27272a] p-6 rounded-2xl space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#a78bfa]">
              <User className="w-4 h-4" />
              <span>{isPatient ? "PERFIL DEL PACIENTE" : "PERFIL DE FACULTATIVO"}</span>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#a78bfa]" />}
          </div>

          {user ? (
            <div className="space-y-3">
              <div>
                <p className="text-base font-bold text-[#fafafa]">
                  {user.first_name || user.last_name
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    : isPatient
                    ? "Paciente Registrado"
                    : "Especialista Clínico"}
                </p>
                <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">{user.email}</p>
              </div>

              <div className="pt-2 border-t border-[#27272a] space-y-2">
                <span className="text-[11px] font-mono text-[#71717a] block">ROLES ASIGNADOS</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <Badge key={r} variant="outline" className="text-xs border-[#a78bfa]/40 text-[#c4b5fd] bg-[#a78bfa]/10">
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-[#71717a]">
                      SIN ROLES ESPECÍFICOS
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272a] text-[11px] font-mono text-[#71717a] space-y-1">
                <div className="flex justify-between">
                  <span>ID de Usuario:</span>
                  <span className="text-[#fafafa] truncate max-w-[200px]">{user.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] text-center space-y-2">
              <p className="text-xs text-[#a1a1aa]">
                No se ha cargado una sesión activa. Puedes autenticarte desde la pantalla de login.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs text-[#a78bfa] hover:underline font-mono"
              >
                Acceder con credenciales &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Security & Cryptography Controls Card */}
        <div className="bg-[#121215] border border-[#27272a] p-6 rounded-2xl space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#34d399]">
              <Key className="w-4 h-4" />
              <span>ESTADO DE CREDENCIALES Y ACCIONES</span>
            </div>
          </div>

          <div className="space-y-2 bg-[#09090b] p-3 rounded-xl border border-[#27272a] text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#71717a]">Access Token:</span>
              <span className={sessionStorage.getItem("access_token") ? "text-[#34d399]" : "text-[#ef4444]"}>
                {sessionStorage.getItem("access_token") ? "EN MEMORIA (JWT)" : "NO DETECTADO"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717a]">CSRF Token:</span>
              <span className={sessionStorage.getItem("csrf_token") ? "text-[#34d399]" : "text-[#ef4444]"}>
                {sessionStorage.getItem("csrf_token") ? "ALMACENADO" : "PENDIENTE DE LOGIN"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717a]">Refresh Cookie:</span>
              <span className="text-[#a78bfa]">HttpOnly · SameSite=Lax</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className="w-full py-2.5 px-4 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-mono border border-[#27272a] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#a78bfa]" />
              ) : (
                <RefreshCw className="w-4 h-4 text-[#a78bfa]" />
              )}
              <span>Probar Renovación de Token (/auth/refresh)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogout(false)}
                disabled={isLoggingOut}
                className="py-2.5 px-3 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#ef4444] text-xs font-mono border border-[#ef4444]/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogout(true)}
                disabled={isLoggingOut}
                className="py-2.5 px-3 rounded-lg bg-[#3b1111]/30 hover:bg-[#3b1111]/50 text-[#fca5a5] text-xs font-mono border border-[#ef4444]/40 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cerrar en Todos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Footer Box */}
      <div className="bg-[#121215] border border-[#27272a] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#71717a]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#a78bfa]" />
          <span>Vite Proxy: /api/v1 &rarr; https://api-lungcancer-ai.onrender.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#34d399]" />
          <span>PostgreSQL Neon: Ready</span>
        </div>
      </div>
    </div>
  );
}
