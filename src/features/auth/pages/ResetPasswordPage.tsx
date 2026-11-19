import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth.schemas";
import { authService } from "../services/auth.service";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "axios";

interface ResetPasswordPageProps {
  onSubmitMock?: (data: { token: string; password: string }) => Promise<void>;
}

export function ResetPasswordPage({ onSubmitMock }: ResetPasswordPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password") || "";
  const confirmPasswordVal = watch("confirmPassword") || "";

  // Password rules evaluation
  const rules = useMemo(() => {
    const hasMinLength = passwordVal.length >= 8;
    const hasCase = /[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal);
    const hasSymbolNum = /[0-9]/.test(passwordVal) && /[^A-Za-z0-9]/.test(passwordVal);
    const hasMatch = passwordVal.length > 0 && passwordVal === confirmPasswordVal;

    const count = [hasMinLength, hasCase, hasSymbolNum, hasMatch].filter(Boolean).length;

    // Strength score
    let strengthScore = 0;
    if (passwordVal.length >= 6) strengthScore++;
    if (passwordVal.length >= 8 && hasCase) strengthScore++;
    if (hasSymbolNum) strengthScore++;
    if (passwordVal.length >= 12 && hasCase && hasSymbolNum) strengthScore++;

    let strengthLabel = "Sin evaluar";
    let strengthColor = "text-[#71717a]";
    if (passwordVal.length > 0) {
      if (strengthScore <= 1) {
        strengthLabel = "Muy Débil";
        strengthColor = "text-[#ef4444]";
      } else if (strengthScore === 2) {
        strengthLabel = "Aceptable";
        strengthColor = "text-[#c4b5fd]";
      } else if (strengthScore === 3) {
        strengthLabel = "Fuerte";
        strengthColor = "text-[#a78bfa]";
      } else {
        strengthLabel = "Excelente";
        strengthColor = "text-[#34d399]";
      }
    }

    return {
      hasMinLength,
      hasCase,
      hasSymbolNum,
      hasMatch,
      count,
      strengthScore,
      strengthLabel,
      strengthColor,
    };
  }, [passwordVal, confirmPasswordVal]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setErrorMessage(null);
    const activeToken = data.token || tokenFromUrl;

    if (!activeToken) {
      setErrorMessage("No se ha proporcionado un token válido para restablecer la contraseña.");
      return;
    }

    try {
      if (onSubmitMock) {
        await onSubmitMock({ token: activeToken, password: data.password });
      } else {
        await authService.resetPassword({
          token: activeToken,
          password: data.password,
        });
      }

      setIsSuccess(true);
      toast.success("Contraseña actualizada con éxito");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setErrorMessage("El enlace de restablecimiento es inválido o ha expirado. Solicita uno nuevo.");
        } else {
          setErrorMessage(err.response?.data?.message || "Error al actualizar la contraseña.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error de comunicación con el servicio de autenticación.");
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="w-full bg-[#121215] border border-[#27272a]/70 rounded-2xl shadow-2xl shadow-black/80 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-48 h-48 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a78bfa] shadow-inner">
              <KeyRound className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a78bfa] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#a78bfa]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono tracking-widest text-[#a78bfa] font-semibold uppercase">
                  PulmoScan
                </span>
                <span className="text-[10px] text-[#71717a] font-mono">/</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                  AUTH-SRV
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                Terminal Clínico Verificado
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono text-[#34d399] px-2 py-1 rounded bg-[#18181b] border border-[#27272a]">
            TLS 1.3 ENC
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">
            Establecer nueva contraseña
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
            Introduce y confirma tu nueva credencial de seguridad para acceder a la estación diagnóstica.
          </p>
        </div>

        {/* Warning if token missing in URL */}
        {!tokenFromUrl && !isSuccess && (
          <Alert className="mb-5 bg-[#3b1111]/40 border-[#ef4444]/30 text-[#fca5a5]">
            <AlertCircle className="h-4 w-4 text-[#ef4444]" />
            <AlertDescription className="text-xs">
              No se detectó un token en el enlace. Si abriste este enlace desde tu correo, asegúrate de copiarlo completo, o solicita un nuevo enlace.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-5 bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
            <AlertCircle className="h-4 w-4 text-[#ef4444]" />
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isSuccess ? (
          /* Success Screen */
          <div className="space-y-5 text-center py-2">
            <div className="p-5 rounded-xl bg-[#18181b] border border-[#34d399]/40 space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[#34d399]/15 text-[#34d399]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-[#fafafa]">
                Contraseña Actualizada con Éxito
              </h2>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Tus credenciales criptográficas han sido sincronizadas en el servidor médico de PulmoScan. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <span>Acceder al Portal Seguro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* If no token was found in URL, show manual token input fallback */}
            {!tokenFromUrl && (
              <div className="space-y-1.5 text-left">
                <label htmlFor="token" className="text-xs font-medium text-[#fafafa] tracking-wide block">
                  Token de restablecimiento
                </label>
                <input
                  id="token"
                  type="text"
                  placeholder="Introduce el código recibido por correo"
                  {...register("token")}
                  className="w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg px-3.5 py-2.5 outline-none border border-[#27272a] focus:border-[#a78bfa] transition-all"
                />
              </div>
            )}

            {/* Field 1: New Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="password" 
                  className="text-xs font-medium text-[#fafafa] uppercase tracking-wider font-mono block"
                >
                  Nueva contraseña
                </label>
                <span className={`text-[11px] font-mono font-medium ${rules.strengthColor}`}>
                  {rules.strengthLabel}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-10 py-2.5 outline-none border transition-all duration-150 ${
                    errors.password
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#a78bfa]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] transition-colors p-1 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength Meter Bar */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4].map((step) => {
                  let barColor = "bg-[#27272a]";
                  if (rules.strengthScore >= step) {
                    if (rules.strengthScore === 1) barColor = "bg-[#ef4444]";
                    else if (rules.strengthScore === 2) barColor = "bg-[#c4b5fd]";
                    else if (rules.strengthScore === 3) barColor = "bg-[#a78bfa]";
                    else barColor = "bg-[#34d399]";
                  }
                  return (
                    <div
                      key={step}
                      className={`h-1 rounded-full transition-colors duration-300 ${barColor}`}
                    />
                  );
                })}
              </div>
              {errors.password && (
                <p className="text-[11px] text-[#ef4444] mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Field 2: Confirm Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="confirmPassword" 
                  className="text-xs font-medium text-[#fafafa] uppercase tracking-wider font-mono block"
                >
                  Confirmar nueva contraseña
                </label>
                <span className={`text-[11px] font-mono ${
                  confirmPasswordVal.length === 0
                    ? "text-[#71717a]"
                    : rules.hasMatch
                    ? "text-[#34d399]"
                    : "text-[#ef4444]"
                }`}>
                  {confirmPasswordVal.length === 0 ? "Pendiente" : rules.hasMatch ? "Correcto" : "No coincide"}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  {...register("confirmPassword")}
                  className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-10 py-2.5 outline-none border transition-all duration-150 ${
                    errors.confirmPassword
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#a78bfa]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] transition-colors p-1 rounded"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#ef4444] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Checklist of rules */}
            <div className="bg-[#0f0f12] p-3.5 rounded-xl border border-[#27272a]/60 space-y-2 mt-4 text-left">
              <div className="text-[11px] font-mono font-medium text-[#a1a1aa] uppercase tracking-wider flex items-center justify-between">
                <span>Parámetros Criptográficos</span>
                <span className="text-[10px] text-[#71717a]">{rules.count}/4 Cumplidos</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#a1a1aa]">
                <li className={`flex items-center gap-2 ${rules.hasMinLength ? "text-[#34d399]" : "text-[#71717a]"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Longitud mínima de 8 caracteres</span>
                </li>
                <li className={`flex items-center gap-2 ${rules.hasCase ? "text-[#34d399]" : "text-[#71717a]"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Al menos una mayúscula y una minúscula</span>
                </li>
                <li className={`flex items-center gap-2 ${rules.hasSymbolNum ? "text-[#34d399]" : "text-[#71717a]"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Un número y un símbolo especial (@, #, $, etc.)</span>
                </li>
                <li className={`flex items-center gap-2 ${rules.hasMatch ? "text-[#34d399]" : "text-[#71717a]"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Ambas contraseñas coinciden exactamente</span>
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#121215] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0a0012]" />
                    <span>Guardando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Guardar nueva contraseña</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancelar y volver al portal de acceso</span>
              </Link>
            </div>
          </form>
        )}

        {/* Security Status Badges Inside Card */}
        <div className="mt-6 pt-4 bg-[#18181b]/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-3.5 flex items-center justify-between text-[11px] text-[#a1a1aa] border-t border-[#27272a]/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-mono text-[11px]">Nodo DICOM PACS · Conectado</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] font-mono">
            HIPAA & RGPD LEVEL-4
          </span>
        </div>
      </div>
    </div>
  );
}
