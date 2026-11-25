import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activateAccountSchema, type ActivateAccountInput } from "../schemas/auth.schemas";
import { authService } from "../services/auth.service";
import { 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Activity, 
  PhoneCall, 
  ArrowRight,
  Database
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "axios";

interface ActivateAccountPageProps {
  onSubmitMock?: (data: ActivateAccountInput) => Promise<void>;
}

export function ActivateAccountPage({ onSubmitMock }: ActivateAccountPageProps) {
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
  } = useForm<ActivateAccountInput>({
    resolver: zodResolver(activateAccountSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password") || "";
  const confirmPasswordVal = watch("confirmPassword") || "";

  // Password requirements calculation
  const rules = useMemo(() => {
    const hasMinLength = passwordVal.length >= 8;
    const hasUpper = /[A-Z]/.test(passwordVal);
    const hasLower = /[a-z]/.test(passwordVal);
    const hasDigit = /[0-9]/.test(passwordVal);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordVal);
    const hasMatch = passwordVal.length > 0 && passwordVal === confirmPasswordVal;

    const count = [hasMinLength, hasUpper && hasLower, hasDigit, hasSpecial, hasMatch].filter(Boolean).length;

    return {
      hasMinLength,
      hasUpperLower: hasUpper && hasLower,
      hasDigit,
      hasSpecial,
      hasMatch,
      count,
    };
  }, [passwordVal, confirmPasswordVal]);

  const onSubmit = async (data: ActivateAccountInput) => {
    setErrorMessage(null);
    const activeToken = data.token || tokenFromUrl;

    if (!activeToken) {
      setErrorMessage("Se requiere un token de asignación clínica válido.");
      return;
    }

    try {
      if (onSubmitMock) {
        await onSubmitMock(data);
      } else {
        await authService.activateAccount({
          token: activeToken,
          password: data.password,
        });
      }

      setIsSuccess(true);
      toast.success("Credencial hospitalaria activada con éxito");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setErrorMessage("El enlace o token de invitación es inválido, ha expirado o ya fue utilizado.");
        } else {
          setErrorMessage(err.response?.data?.message || "Error al activar la cuenta clínica.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error de conexión al activar la credencial.");
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 sm:gap-6 py-2 sm:py-4">
      {/* Top IAM Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-[#121215] border border-[#27272a] px-4 sm:px-5 py-2.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-mono min-w-0">
          <ShieldCheck className="w-4 h-4 text-[#a78bfa] shrink-0" />
          <span className="text-[#a78bfa] font-semibold uppercase">SERVICIOS CENTRALES IAM // SIS-HOSP-09</span>
          <span className="text-[#52525b] hidden sm:inline">/</span>
          <span className="text-[#a1a1aa]">POLÍTICA DE IDENTIDAD ENTORNO CRÍTICO</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
          <span className="text-[#34d399]">ENCLAVE SINCRO: ACTIVO</span>
          <span className="px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
            SEC-3
          </span>
        </div>
      </div>

      {/* Main Grid: Form (left) + Tactical Context (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Form Area */}
        <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">
          <div className="bg-[#121215] border border-[#27272a]/80 p-5 sm:p-8 rounded-2xl relative overflow-hidden shadow-xl backdrop-blur-xl">
            <div 
              aria-hidden="true" 
              className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#a78bfa]/10 blur-2xl pointer-events-none" 
            />

            <div className="relative z-10 flex flex-col gap-1.5 mb-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono text-[#a78bfa]">
                <span>MÓDULO DE GESTIÓN DE ACCESOS CRÍTICOS</span>
                <span className="px-1.5 py-0.5 rounded bg-[#a78bfa]/15 text-[10px] text-[#c4b5fd]">
                  DICOM 3.0 / HIPAA READY
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#fafafa] tracking-tight">
                Activación y Desbloqueo de Credencial Clínica
              </h1>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Configure su credencial de acceso a la estación de trabajo y análisis volumétrico de nódulos pulmonares. Procedimiento auditado por la Dirección Médica.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-5 bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
                <AlertCircle className="h-4 w-4 text-[#ef4444]" />
                <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {isSuccess ? (
              /* Success View */
              <div className="p-6 rounded-xl bg-[#18181b] border border-[#34d399]/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#34d399]/20 flex items-center justify-center text-[#34d399]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#fafafa]">
                      Credencial Facultativa Activada con Éxito
                    </h2>
                    <p className="text-xs text-[#34d399] font-mono">
                      Certificado de radiólogo distribuido al clúster PACS.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Su cuenta ha sido validada y su clave criptográfica ha sido sellada. Ya puede iniciar sesión con su correo y contraseña en la estación médica.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Iniciar Sesión en PulmoScan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                {/* Step 1: Token */}
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label htmlFor="token" className="text-xs font-medium text-[#fafafa] tracking-wide block">
                      Código de Asignación Hospitalaria o Token
                    </label>
                    <span className="text-[10px] text-[#71717a] font-mono">Formato RAD-XXXX-NNNN</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="token"
                      type="text"
                      placeholder="Ej. RAD-VAL-8821-TK"
                      {...register("token")}
                      className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-3.5 py-2.5 outline-none border transition-all ${
                        errors.token ? "border-[#ef4444]" : "border-[#27272a] focus:border-[#a78bfa]"
                      }`}
                    />
                  </div>
                  {errors.token && (
                    <p className="text-[11px] text-[#ef4444]">{errors.token.message}</p>
                  )}
                  <p className="text-[11px] text-[#71717a]">
                    Proporcionado en el correo de invitación por la Jefatura del Servicio de Radiología.
                  </p>
                </div>

                {/* Step 2: Passwords Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-medium text-[#fafafa] tracking-wide block">
                      Nueva Contraseña Criptográfica
                    </label>
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
                        className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-10 py-2.5 outline-none border transition-all ${
                          errors.password ? "border-[#ef4444]" : "border-[#27272a] focus:border-[#a78bfa]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar" : "Ver"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-[#ef4444]">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-medium text-[#fafafa] tracking-wide block">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        {...register("confirmPassword")}
                        className={`w-full bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b] text-sm rounded-lg pl-10 pr-10 py-2.5 outline-none border transition-all ${
                          errors.confirmPassword ? "border-[#ef4444]" : "border-[#27272a] focus:border-[#a78bfa]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar" : "Ver"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-[#ef4444]">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Policy Checklist */}
                <div className="bg-[#0f0f12] p-4 rounded-xl border border-[#27272a] space-y-2 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-[#a1a1aa] uppercase">
                    <span>Matriz de Seguridad Hospitalaria (ENS / Argon2id)</span>
                    <span className="text-[#71717a]">{rules.count}/5 Requisitos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#a1a1aa]">
                    <div className={`flex items-center gap-2 ${rules.hasMinLength ? "text-[#34d399]" : "text-[#71717a]"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 ${rules.hasUpperLower ? "text-[#34d399]" : "text-[#71717a]"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mayúsculas y minúsculas</span>
                    </div>
                    <div className={`flex items-center gap-2 ${rules.hasDigit ? "text-[#34d399]" : "text-[#71717a]"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Al menos un número</span>
                    </div>
                    <div className={`flex items-center gap-2 ${rules.hasSpecial ? "text-[#34d399]" : "text-[#71717a]"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Caracteres especiales (@, #, $)</span>
                    </div>
                    <div className={`flex items-center gap-2 sm:col-span-2 ${rules.hasMatch ? "text-[#34d399]" : "text-[#71717a]"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ambas contraseñas coinciden</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Link
                    to="/login"
                    className="text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-center sm:text-left"
                  >
                    ¿Ya tienes credencial activa? Inicia sesión
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0a0012]" />
                        <span>Verificando y Activando...</span>
                      </>
                    ) : (
                      <>
                        <span>Verificar y Activar Credencial</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Col: Tactical Context / Support Rail */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-left">
          {/* Emergency Card */}
          <div className="bg-[#18181b] border border-[#ef4444]/30 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-[#ef4444] text-xs font-mono mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <PhoneCall className="w-4 h-4" />
                GUARDIA MÉDICA CRÍTICA
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
            </div>
            <h3 className="text-sm font-semibold text-[#fafafa] mb-1">
              Soporte Radiología 24/7
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
              En caso de bloqueo o guardia urgente de tórax, contacte a la Centralita IAM (Ext. 4402).
            </p>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#121215] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] block">Ext. Prioritaria</span>
                <span className="text-sm font-bold text-[#a78bfa]">4402</span>
              </div>
              <div className="p-2 rounded bg-[#121215] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] block">Centralita</span>
                <span className="text-sm font-bold text-[#fafafa]">91-450-00</span>
              </div>
            </div>
          </div>

          {/* Telemetry card */}
          <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
              <span>ESTADO DE ENCLAVE CLÍNICO</span>
              <Activity className="w-4 h-4 text-[#34d399]" />
            </div>
            <div className="space-y-2 text-xs font-mono bg-[#09090b] p-3 rounded-xl border border-[#27272a]/60">
              <div className="flex items-center justify-between">
                <span className="text-[#71717a]">PACS Gateway</span>
                <span className="text-[#34d399] font-medium">CONECTADO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717a]">Inferencia IA</span>
                <span className="text-[#34d399] font-medium">ONLINE (0.04s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717a]">Clúster TLS</span>
                <span className="text-[#a78bfa] font-medium">1.3 SYNC</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
              <Database className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>Base de datos Render / PostgreSQL sincronizada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
