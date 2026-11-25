import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inviteClinicianSchema,
  type InviteClinicianInput,
} from "@/features/auth/schemas/auth.schemas";
import { authService } from "@/features/auth/services/auth.service";
import { adminService } from "../services/admin.service";
import { extractApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import {
  UserPlus,
  Mail,
  User,
  Shield,
  Loader2,
  X,
  CheckCircle,
  Copy,
  AlertCircle,
} from "lucide-react";

interface InviteClinicianDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

interface IssuedInvitation {
  email: string;
  token?: string;
  expiresAt?: string;
}

export function InviteClinicianDialog({
  isOpen,
  onClose,
  onInvited,
}: InviteClinicianDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [issuedInvitation, setIssuedInvitation] = useState<IssuedInvitation | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteClinicianInput>({
    resolver: zodResolver(inviteClinicianSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role_code: "RADIOLOGIST",
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setApiError(null);
    setIssuedInvitation(null);
    onClose();
  };

  const onSubmit = async (data: InviteClinicianInput) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await authService.inviteAccount({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role_code: data.role_code,
      });

      const responseData = response.data as {
        user_id?: string;
        activation_token?: string;
        invitation_token?: string;
        expires_at?: string;
      } | undefined;

      if (responseData?.user_id && data.role_code) {
        try {
          await adminService.assignUserRole(responseData.user_id, data.role_code);
        } catch {
          toast.warning("Cuenta invitada, pero no se pudo asignar el rol inicial automáticamente.");
        }
      }

      setIssuedInvitation({
        email: data.email,
        token: responseData?.activation_token || responseData?.invitation_token,
        expiresAt: responseData?.expires_at,
      });

      onInvited?.();
      toast.success(`Invitación emitida para ${data.email}`);
    } catch (err: unknown) {
      const parsed = extractApiError(
        err,
        "Error al emitir la invitación clínica. Verifica tus permisos de administrador."
      );
      setApiError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyActivationLink = (token: string) => {
    const url = `${window.location.origin}/activate?token=${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace de activación copiado al portapapeles");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col gap-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 id="dialog-title" className="text-base font-semibold text-[#fafafa] tracking-tight">
              Invitar Facultativo al Nodo Clínico
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Emite una credencial hospitalaria segura con caducidad temporal
            </p>
          </div>
        </div>

        {/* Success Card or Form */}
        {issuedInvitation ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 rounded-xl bg-[#065f46]/20 border border-[#065f46]/40 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#34d399] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold text-[#fafafa]">
                  Invitación emitida exitosamente
                </span>
                <p className="text-xs text-[#a1a1aa] break-words">
                  Se ha generado el token de activación para{" "}
                  <strong className="text-[#fafafa] break-all">{issuedInvitation.email}</strong>.
                </p>
              </div>
            </div>

            {issuedInvitation.token && (
              <div className="p-4 rounded-xl bg-[#121215] border border-[#27272a] flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">
                    Token de Activación Directa
                  </span>
                  <button
                    type="button"
                    onClick={() => copyActivationLink(issuedInvitation.token!)}
                    className="flex items-center gap-1.5 text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a] font-mono text-[11px] text-[#fafafa] break-all select-all">
                  {issuedInvitation.token}
                </div>
                <p className="text-[10px] text-[#71717a] font-mono break-all">
                  Enlace: {window.location.origin}/activate?token=...
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-medium text-xs transition-colors"
              >
                Cerrar y volver al panel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {apiError && (
              <div className="p-3 rounded-lg bg-[#3b1111]/40 border border-[#ef4444]/40 flex items-start gap-2.5 text-xs text-[#ef4444]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{apiError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invite-email" className="text-xs font-medium text-[#a1a1aa]">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                <input
                  id="invite-email"
                  type="email"
                  placeholder="ej. dr.carlos@hospital.es"
                  {...register("email")}
                  className={`w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg pl-9 pr-3 py-2 border transition-colors focus:outline-none ${
                    errors.email
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#a78bfa]"
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-[#ef4444] font-medium">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="invite-first-name" className="text-xs font-medium text-[#a1a1aa]">
                  Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    id="invite-first-name"
                    type="text"
                    placeholder="Carlos"
                    {...register("first_name")}
                    className={`w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg pl-9 pr-3 py-2 border transition-colors focus:outline-none ${
                      errors.first_name
                        ? "border-[#ef4444] focus:border-[#ef4444]"
                        : "border-[#27272a] focus:border-[#a78bfa]"
                    }`}
                  />
                </div>
                {errors.first_name && (
                  <span className="text-[11px] text-[#ef4444] font-medium">
                    {errors.first_name.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="invite-last-name" className="text-xs font-medium text-[#a1a1aa]">
                  Apellidos
                </label>
                <input
                  id="invite-last-name"
                  type="text"
                  placeholder="Gómez Navas"
                  {...register("last_name")}
                  className={`w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg px-3 py-2 border transition-colors focus:outline-none ${
                    errors.last_name
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#a78bfa]"
                  }`}
                />
                {errors.last_name && (
                  <span className="text-[11px] text-[#ef4444] font-medium">
                    {errors.last_name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invite-role" className="text-xs font-medium text-[#a1a1aa]">
                Rol Clínico / Nivel de Privilegios
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                <select
                  id="invite-role"
                  {...register("role_code")}
                  className="w-full bg-[#121215] text-xs text-[#fafafa] rounded-lg pl-9 pr-8 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa] transition-colors appearance-none cursor-pointer"
                >
                  <option value="RADIOLOGIST">RADIOLOGIST · Radiólogo Especialista (Diagnóstico TC)</option>
                  <option value="ADMIN">ADMIN · Administrador TI / Nodo PACS</option>
                  <option value="PATIENT">PATIENT · Paciente Consulta Externa</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#27272a]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Emitiendo...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Emitir Invitación Clínica</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
