import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas/auth.schemas";
import { useAuth } from "../context/AuthContext";
import { Activity, Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "axios";

interface LoginPageProps {
  onSuccess?: () => void;
  onSubmitMock?: (data: LoginInput) => Promise<void>;
}

export function LoginPage({ onSuccess, onSubmitMock }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      if (onSubmitMock) {
        await onSubmitMock(data);
      } else {
        await login({
          email: data.email,
          password: data.password,
        });
      }

      toast.success("Autenticación exitosa", {
        description: "Accediendo a la estación clínica...",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
        if (from && from !== "/login" && from !== "/forbidden") {
          navigate(from, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMessage("Credenciales inválidas. Comprueba tu correo y contraseña.");
        } else if (err.response?.status === 403) {
          setErrorMessage("Tu cuenta está inactiva o requiere activación.");
        } else if (err.response?.status === 429) {
          setErrorMessage("Demasiados intentos fallidos. Por seguridad, espera unos minutos.");
        } else if (err.code === "ERR_NETWORK") {
          setErrorMessage("No se pudo conectar con el servidor médico. Verifica tu conexión de red.");
        } else {
          setErrorMessage(err.response?.data?.message || "Error al iniciar sesión. Inténtalo de nuevo.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al autenticar.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Card Container */}
      <div className="w-full bg-[#121215] border border-[#27272a]/70 rounded-2xl shadow-2xl shadow-black/80 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-48 h-48 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none" 
        />
        <div 
          aria-hidden="true" 
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#34d399]/5 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Card Header */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="h-12 w-12 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shadow-inner mb-3 transition-transform duration-300 hover:scale-105">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-[#a1a1aa] max-w-xs mt-1.5 leading-relaxed">
            Introduce tus credenciales para acceder a la estación de trabajo y nodo PACS
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-5 bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
            <AlertCircle className="h-4 w-4 text-[#ef4444]" />
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label 
              htmlFor="email" 
              className="text-xs font-medium text-[#fafafa] tracking-wide block"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@institucion.org"
                {...register("email")}
                className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-3.5 py-2.5 outline-none border transition-all duration-150 ${
                  errors.email
                    ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
                    : "border-[#27272a] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-[#ef4444] mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="text-xs font-medium text-[#fafafa] tracking-wide block"
              >
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] hover:underline transition-colors focus:outline-none focus:text-[#c4b5fd]"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                {...register("password")}
                className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-10 py-2.5 outline-none border transition-all duration-150 ${
                  errors.password
                    ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
                    : "border-[#27272a] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] transition-colors p-1 rounded focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-[#ef4444] mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center pt-1 pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                id="remember"
                {...register("remember")}
                className="w-4 h-4 rounded bg-[#09090b] border-[#27272a] text-[#a78bfa] focus:ring-[#a78bfa] focus:ring-offset-[#121215] accent-[#a78bfa]"
              />
              <span className="text-xs text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors">
                Mantener sesión iniciada
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#121215] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0a0012]" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Account activation invitation helper link */}
        <div className="mt-4 pt-3 border-t border-[#27272a]/30 text-center">
          <p className="text-xs text-[#71717a]">
            ¿Recibiste una invitación clínica?{" "}
            <Link to="/activate" className="text-[#a78bfa] hover:underline font-medium">
              Activar cuenta
            </Link>
          </p>
        </div>

        {/* PACS Node Status in Card Footer */}
        <div className="mt-6 pt-4 bg-[#18181b]/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-3.5 flex items-center justify-between text-[11px] text-[#a1a1aa] border-t border-[#27272a]/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-mono text-[11px]">Nodo DICOM PACS · Conectado</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-[#71717a]">
            <Lock className="w-3 h-3 text-[#34d399]" />
            <span>TLS 1.3 / E2EE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
