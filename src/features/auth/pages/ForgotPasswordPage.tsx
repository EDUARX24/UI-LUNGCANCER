import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth.schemas";
import { authService } from "../services/auth.service";
import { KeyRound, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "axios";

interface ForgotPasswordPageProps {
  onSubmitMock?: (data: ForgotPasswordInput) => Promise<void>;
}

export function ForgotPasswordPage({ onSubmitMock }: ForgotPasswordPageProps) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setErrorMessage(null);
    try {
      if (onSubmitMock) {
        await onSubmitMock(data);
      } else {
        await authService.forgotPassword({
          email: data.email,
        });
      }

      setSubmittedEmail(data.email);
      toast.success("Solicitud procesada correctamente");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setErrorMessage("Límite de solicitudes alcanzado. Por favor, espera antes de reintentar.");
        } else {
          setErrorMessage(err.response?.data?.message || "Error al solicitar restablecimiento.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error de conexión al emitir la solicitud.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Recovery Card Container */}
      <div className="w-full bg-[#121215] border border-[#27272a]/70 rounded-2xl shadow-2xl shadow-black/80 p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-48 h-48 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Branding & Icon */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-lg mb-3">
            <KeyRound className="w-6 h-6 text-[#a78bfa]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34d399]" />
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">
            <span className="font-semibold text-[#fafafa]">PulmoScan</span>
            <span className="text-[#52525b]">/</span>
            <span>AUTH-SRV</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa]">
            Recuperar contraseña
          </h1>
          <p className="text-xs text-[#a1a1aa] max-w-xs mt-1.5 leading-relaxed">
            Introduce el correo electrónico institucional asociado a tu cuenta para recibir las instrucciones de restablecimiento.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-5 bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
            <AlertCircle className="h-4 w-4 text-[#ef4444]" />
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {submittedEmail ? (
          /* Success confirmation state */
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#34d399]/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#34d399]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold">Enlace de recuperación emitido</span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Si el correo <span className="font-mono text-[#fafafa] break-all">{submittedEmail}</span> coincide con una credencial médica activa, se ha enviado un enlace de un solo uso con validez de <strong className="text-[#fafafa]">15 minutos</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/reset-password"
                className="w-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-xs py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 group active:scale-[0.99]"
              >
                <span>Ingresar token y nueva contraseña</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-medium border border-[#27272a] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inicio de sesión</span>
              </Link>

              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="text-xs text-[#a1a1aa] hover:text-[#c4b5fd] hover:underline transition-colors mt-1"
              >
                ¿No recibiste el correo? Intentar con otra dirección
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-2 text-left">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label 
                  htmlFor="email" 
                  className="text-xs font-medium text-[#fafafa] tracking-wide block"
                >
                  Correo electrónico institucional
                </label>
                <span className="text-[10px] text-[#71717a] font-mono">ID CLÍNICO</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="dr.garcia@hospital-salud.org"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#121215] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0a0012]" />
                  <span>Generando token seguro...</span>
                </>
              ) : (
                <>
                  <span>Enviar instrucciones</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* Back to login link */}
            <div className="pt-2 border-t border-[#27272a]/40 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio de sesión</span>
              </Link>
            </div>
          </form>
        )}

        {/* Footer inside card */}
        <div className="mt-6 pt-4 bg-[#18181b]/50 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a1a1aa] border-t border-[#27272a]/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shrink-0" />
            <span className="font-mono text-[11px]">Nodo DICOM PACS · Conectado</span>
          </div>
          <span className="font-mono text-[10px] text-[#71717a]">TLS 1.3 / E2EE</span>
        </div>
      </div>
    </div>
  );
}
