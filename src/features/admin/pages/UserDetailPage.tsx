import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  History,
  Save,
  Copy,
  Mail,
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCog,
  Ban,
  PowerOff,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { adminService } from "../services/admin.service";
import { userUpdateSchema, type UserUpdateFormData } from "../schemas/admin.schemas";
import type { UpdatableUserStatus } from "../types";
import { extractApiError } from "@/lib/api/errors";
import { formatDateTime, getInitials } from "@/lib/formatters";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DossierTab = "overview" | "rbac" | "audit";

export function UserDetailPage() {
  const { userId = "" } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<DossierTab>("overview");
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminService.getUser(userId),
    enabled: Boolean(userId),
  });

  const rolesCatalogQuery = useQuery({
    queryKey: ["admin-roles-catalog"],
    queryFn: () => adminService.listRoles(1, 50),
    staleTime: 5 * 60 * 1000,
  });

  const userAuditQuery = useQuery({
    queryKey: ["admin-user-audit", userId],
    queryFn: () =>
      adminService.listAuditEvents({
        page: 1,
        size: 15,
        target_user_id: userId,
      }),
    enabled: Boolean(userId) && activeTab === "audit",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      reset({
        first_name: userQuery.data.first_name,
        last_name: userQuery.data.last_name,
        email: userQuery.data.email,
      });
    }
  }, [userQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: UserUpdateFormData) => adminService.updateUser(userId, payload),
    onSuccess: (updated) => {
      setFormError(null);
      queryClient.setQueryData(["admin-user", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Datos del usuario actualizados correctamente.");
    },
    onError: (err) => {
      const parsed = extractApiError(err, "No se pudieron guardar los cambios del usuario.");
      if (parsed.status === 409) {
        setFormError("El correo electrónico ya está en uso por otra cuenta.");
      } else {
        setFormError(parsed.message);
      }
      toast.error(parsed.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: UpdatableUserStatus) =>
      adminService.updateUserStatus(userId, { status }),
    onSuccess: (updated) => {
      setIsStatusMenuOpen(false);
      queryClient.setQueryData(["admin-user", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Estado actualizado a "${updated.status}".`);
    },
    onError: (err) => {
      const parsed = extractApiError(err, "No se pudo cambiar el estado de la cuenta.");
      toast.error(parsed.message);
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: (roleCode: string) => adminService.assignUserRole(userId, roleCode),
    onSuccess: (_, roleCode) => {
      setSelectedRoleToAdd("");
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Rol ${roleCode} asignado correctamente.`);
    },
    onError: (err) => {
      const parsed = extractApiError(err, "No se pudo asignar el rol.");
      toast.error(parsed.message);
    },
  });

  const revokeRoleMutation = useMutation({
    mutationFn: (roleCode: string) => adminService.revokeUserRole(userId, roleCode),
    onSuccess: (_, roleCode) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Rol ${roleCode} revocado correctamente.`);
    },
    onError: (err) => {
      const parsed = extractApiError(err, "No se pudo revocar el rol.");
      toast.error(parsed.message);
    },
  });

  const user = userQuery.data;
  const isSelf = currentUser?.id === user?.id;
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "";
  const availableRolesToAssign = (rolesCatalogQuery.data?.data ?? []).filter(
    (role) => !user?.roles.includes(role.code)
  );

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    toast.success("ID de usuario copiado al portapapeles");
  };

  if (userQuery.isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#a1a1aa]">
        <Loader2 className="w-7 h-7 animate-spin text-[#a78bfa]" />
        <span>Cargando expediente de usuario clínico...</span>
      </div>
    );
  }

  if (userQuery.isError || !user) {
    const parsed = extractApiError(
      userQuery.error,
      "No se encontró el expediente del usuario solicitado."
    );
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio Clínico</span>
        </Link>
        <Alert variant="destructive" className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
          <AlertDescription className="text-xs">{parsed.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 pb-8">
      {/* Top Command & Breadcrumb Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0c0c0f] border border-[#27272a] rounded-xl px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-wider text-[#71717a] uppercase">
            <span>SISTEMA</span>
            <span>/</span>
            <span>ACCESO &amp; IDENTIDAD</span>
            <span>/</span>
            <Link to="/admin/users" className="text-[#a1a1aa] hover:text-[#a78bfa] transition-colors">
              DIRECTORIO CLÍNICO
            </Link>
            <span>/</span>
            <span className="text-[#a78bfa] font-medium truncate">
              EXPEDIENTE: {fullName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Directorio</span>
            </Link>
            <span className="text-[#27272a] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#71717a] font-mono truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>UUID: {user.id}</span>
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/admin/audit?target_user_id=${encodeURIComponent(user.id)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] text-xs font-medium transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Auditoría de Actividad</span>
          </button>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((prev) => !prev)}
              disabled={statusMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-[#fafafa] hover:bg-[#18181b] text-xs font-medium transition-colors disabled:opacity-50"
            >
              <UserStatusBadge status={user.status} />
              <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#18181b] border border-[#27272a] shadow-xl rounded-lg py-1 z-30 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#71717a]">
                  Cambiar Estado Clínico
                </div>
                {(
                  [
                    { value: "active", label: "Activo", dot: "bg-[#34d399]", text: "text-[#34d399]" },
                    {
                      value: "suspended",
                      label: "Suspendido",
                      dot: "bg-[#ef4444]",
                      text: "text-[#fca5a5]",
                    },
                    {
                      value: "disabled",
                      label: "Deshabilitado",
                      dot: "bg-[#71717a]",
                      text: "text-[#a1a1aa]",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isSelf && opt.value !== "active"}
                    onClick={() => statusMutation.mutate(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#27272a] ${opt.text} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </span>
                    {user.status === opt.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            form="user-profile-form"
            disabled={updateMutation.isPending || !isDirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a78bfa] text-[#0a0012] hover:bg-[#c4b5fd] text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Dossier Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#121215] border border-[#27272a] p-5 sm:p-6 shadow-md">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 w-64 h-64 bg-[#a78bfa]/5 rounded-full blur-3xl pointer-events-none"
        />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 w-full">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] font-bold text-xl sm:text-2xl shadow-inner font-mono">
                {getInitials(user.first_name, user.last_name, user.email)}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121215] flex items-center justify-center border border-[#27272a]"
                title={`Estado: ${user.status}`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    user.status === "active"
                      ? "bg-[#34d399]"
                      : user.status === "pending"
                      ? "bg-amber-400"
                      : "bg-[#ef4444]"
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#fafafa]">
                  {fullName}
                </h1>
                <UserStatusBadge status={user.status} />
                {isSelf && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#a78bfa]/15 text-[#a78bfa] text-[11px] font-mono border border-[#a78bfa]/30">
                    Tu cuenta actual
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#a1a1aa] font-mono">
                <div className="inline-flex items-center gap-1.5 bg-[#09090b] border border-[#27272a] px-2.5 py-1 rounded max-w-full">
                  <span className="text-[#71717a]">ID:</span>
                  <span className="text-[#fafafa] font-medium truncate max-w-[180px] sm:max-w-none">
                    {user.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    aria-label="Copiar ID de usuario"
                    className="text-[#71717a] hover:text-[#a78bfa] ml-1 transition-colors"
                    title="Copiar ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />
                  <span className="text-[#fafafa] break-all">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end w-full lg:w-auto shrink-0 bg-[#09090b]/70 border border-[#27272a] p-3.5 rounded-lg gap-1.5 text-[11px] font-mono">
            <span className="text-[#71717a]">
              Último login:{" "}
              <strong className="text-[#fafafa]">{formatDateTime(user.last_login_at)}</strong>
            </span>
            <span className="text-[#71717a]">
              Correo verificado:{" "}
              <strong className="text-[#34d399]">
                {formatDateTime(user.email_verified_at, "Pendiente")}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#0c0c0f] border border-[#27272a] p-1 rounded-lg overflow-x-auto text-xs font-medium">
        {(
          [
            { id: "overview", label: "Información General & Perfil" },
            { id: "rbac", label: "Roles & Permisos Clínicos (RBAC)" },
            { id: "audit", label: "Auditoría del Usuario" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-md whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[#18181b] text-[#fafafa] shadow-sm font-semibold border border-[#27272a]"
                : "text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#121215]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "audit" ? (
        /* User Audit Tab */
        <div className="rounded-xl bg-[#0c0c0f] border border-[#27272a] p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">
                Eventos de Auditoría sobre este Usuario
              </h2>
              <p className="text-[11px] text-[#71717a] font-mono">
                GET /api/v1/audit/events?target_user_id={user.id}
              </p>
            </div>
            <Link
              to={`/admin/audit?target_user_id=${encodeURIComponent(user.id)}`}
              className="text-xs font-mono text-[#a78bfa] hover:underline"
            >
              Abrir en visor completo &rarr;
            </Link>
          </div>

          {userAuditQuery.isLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs font-mono text-[#a1a1aa]">
              <Loader2 className="w-4 h-4 animate-spin text-[#a78bfa]" />
              <span>Cargando eventos...</span>
            </div>
          ) : (userAuditQuery.data?.data ?? []).length === 0 ? (
            <p className="text-xs text-[#71717a] py-6 text-center">
              No hay eventos registrados para este usuario.
            </p>
          ) : (
            <div className="divide-y divide-[#18181b]">
              {(userAuditQuery.data?.data ?? []).map((ev) => (
                <div
                  key={ev.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-[#fafafa]">
                        {ev.event_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          ev.outcome === "success"
                            ? "bg-[#065f46]/30 text-[#34d399]"
                            : "bg-[#3b1111]/40 text-[#fca5a5]"
                        }`}
                      >
                        {ev.outcome}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#71717a]">
                      IP: {ev.ip_address || "N/A"} · Request: {ev.request_id || "N/A"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#a1a1aa] shrink-0">
                    {formatDateTime(ev.occurred_at, "-")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Grid Content (2/3 + 1/3) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            {activeTab === "overview" && (
              /* Panel 1: Personal Data (PATCH /api/v1/users/{user_id}) */
              <div className="rounded-xl bg-[#121215] border border-[#27272a] p-5 shadow-sm flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#27272a]/70">
                  <div className="flex items-center gap-2.5">
                    <UserCog className="w-5 h-5 text-[#a78bfa]" />
                    <h2 className="text-sm font-semibold tracking-tight text-[#fafafa]">
                      Datos Personales y Credencial de Acceso
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] px-2 py-0.5 bg-[#18181b] rounded border border-[#27272a]">
                    PATCH /api/v1/users/{user.id.slice(0, 8)}...
                  </span>
                </div>

                {formError && (
                  <Alert
                    variant="destructive"
                    className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]"
                  >
                    <AlertCircle className="h-4 w-4 text-[#ef4444]" />
                    <AlertDescription className="text-xs">{formError}</AlertDescription>
                  </Alert>
                )}

                <form
                  id="user-profile-form"
                  onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
                  noValidate
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="edit-first-name"
                      className="text-[11px] font-mono text-[#a1a1aa] uppercase"
                    >
                      Nombre
                    </label>
                    <input
                      id="edit-first-name"
                      type="text"
                      {...register("first_name")}
                      className={`w-full bg-[#09090b] text-xs text-[#fafafa] px-3 py-2 rounded-lg border focus:outline-none ${
                        errors.first_name
                          ? "border-[#ef4444]"
                          : "border-[#27272a] focus:border-[#a78bfa]"
                      }`}
                    />
                    {errors.first_name && (
                      <span className="text-[11px] text-[#ef4444]">
                        {errors.first_name.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="edit-last-name"
                      className="text-[11px] font-mono text-[#a1a1aa] uppercase"
                    >
                      Apellidos
                    </label>
                    <input
                      id="edit-last-name"
                      type="text"
                      {...register("last_name")}
                      className={`w-full bg-[#09090b] text-xs text-[#fafafa] px-3 py-2 rounded-lg border focus:outline-none ${
                        errors.last_name
                          ? "border-[#ef4444]"
                          : "border-[#27272a] focus:border-[#a78bfa]"
                      }`}
                    />
                    {errors.last_name && (
                      <span className="text-[11px] text-[#ef4444]">
                        {errors.last_name.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="edit-email"
                      className="text-[11px] font-mono text-[#a1a1aa] uppercase"
                    >
                      Correo Electrónico Institucional
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      {...register("email")}
                      className={`w-full bg-[#09090b] text-xs text-[#fafafa] px-3 py-2 rounded-lg border focus:outline-none ${
                        errors.email
                          ? "border-[#ef4444]"
                          : "border-[#27272a] focus:border-[#a78bfa]"
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[11px] text-[#ef4444]">{errors.email.message}</span>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={!isDirty || updateMutation.isPending}
                      onClick={() => reset()}
                      className="px-3 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a] disabled:opacity-40"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      disabled={!isDirty || updateMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Actualizar Datos</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Panel 2: RBAC Roles & Management */}
            <div className="rounded-xl bg-[#121215] border border-[#27272a] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#27272a]/70">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-[#a78bfa] shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-[#fafafa]">
                      Roles Asignados &amp; Control RBAC
                    </h2>
                    <p className="text-[11px] text-[#71717a]">
                      PUT / DELETE /api/v1/users/{user.id.slice(0, 8)}.../roles
                    </p>
                  </div>
                </div>

                {/* Assign Role Inline Control */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Seleccionar rol para asignar"
                    value={selectedRoleToAdd}
                    onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                    disabled={availableRolesToAssign.length === 0 || assignRoleMutation.isPending}
                    className="bg-[#09090b] text-xs text-[#fafafa] border border-[#27272a] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#a78bfa]"
                  >
                    <option value="">
                      {availableRolesToAssign.length === 0
                        ? "Todos los roles asignados"
                        : "Seleccionar rol..."}
                    </option>
                    {availableRolesToAssign.map((r) => (
                      <option key={r.id} value={r.code}>
                        {r.code} · {r.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedRoleToAdd || assignRoleMutation.isPending}
                    onClick={() => {
                      if (selectedRoleToAdd) {
                        assignRoleMutation.mutate(selectedRoleToAdd);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a78bfa] text-xs font-medium transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Asignar Rol</span>
                  </button>
                </div>
              </div>

              {isSelf && (
                <p className="text-[11px] font-mono text-amber-300 bg-amber-950/30 border border-amber-800/40 px-3 py-2 rounded-lg">
                  Por seguridad, el backend impide modificar o revocar tus propios roles desde esta
                  sesión.
                </p>
              )}

              {user.roles.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#71717a] text-center">
                  Este usuario aún no tiene roles clínicos asignados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.roles.map((roleCode, index) => {
                    const catalogMatch = rolesCatalogQuery.data?.data.find(
                      (r) => r.code === roleCode
                    );
                    return (
                      <div
                        key={roleCode}
                        className="p-4 rounded-lg bg-[#0f0f12] border border-[#27272a] flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-xs text-[#fafafa]">
                                {catalogMatch?.name || roleCode}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  index === 0
                                    ? "bg-[#a78bfa] text-[#0a0012]"
                                    : "bg-[#18181b] text-[#a1a1aa] border border-[#27272a]"
                                }`}
                              >
                                {index === 0 ? "PRIMARIO" : "ASIGNADO"}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-[#a78bfa] mt-0.5">
                              {roleCode}
                            </span>
                          </div>
                          <ShieldCheck className="w-4 h-4 text-[#34d399] shrink-0" />
                        </div>

                        <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                          {catalogMatch?.description ||
                            "Rol de identidad registrado en el catálogo RBAC del sistema."}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#18181b] text-[10px] font-mono text-[#71717a]">
                          <span>{catalogMatch?.is_system ? "Rol de Sistema" : "Rol Clínico"}</span>
                          <button
                            type="button"
                            disabled={isSelf || revokeRoleMutation.isPending}
                            onClick={() => revokeRoleMutation.mutate(roleCode)}
                            className="inline-flex items-center gap-1 text-[#ef4444] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Revocar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#fafafa]">
                  <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                  <span>Consulta los permisos disponibles en el catálogo RBAC</span>
                </div>
                <Link
                  to="/admin/roles"
                  className="text-xs text-[#a78bfa] hover:underline font-mono"
                >
                  Ver matriz RBAC &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Operational Access Control */}
            <div className="rounded-xl bg-[#121215] border border-[#27272a] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#27272a]/70">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">
                  Control de Acceso Operativo
                </h3>
                <span className="text-[9px] font-mono text-[#71717a]">PATCH /status</span>
              </div>

              <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-between gap-2">
                <span className="text-xs text-[#a1a1aa]">Estado actual:</span>
                <UserStatusBadge status={user.status} />
              </div>

              <p className="text-[11px] text-[#71717a] leading-relaxed">
                Suspender o deshabilitar una cuenta revoca de inmediato todas sus sesiones activas en
                el servidor.
              </p>

              <div className="flex flex-col gap-2">
                {user.status !== "active" && (
                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate("active")}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#065f46]/30 text-[#34d399] hover:bg-[#065f46]/50 border border-[#065f46]/50 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activar / Reactivar Cuenta</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSelf || user.status === "suspended" || statusMutation.isPending}
                  onClick={() => statusMutation.mutate("suspended")}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#3b1111]/40 text-[#fca5a5] hover:bg-[#3b1111]/70 border border-[#ef4444]/30 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Ban className="w-4 h-4" />
                  <span>Suspender Acceso Inmediato</span>
                </button>

                <button
                  type="button"
                  disabled={isSelf || user.status === "disabled" || statusMutation.isPending}
                  onClick={() => statusMutation.mutate("disabled")}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Deshabilitar Cuenta</span>
                </button>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="rounded-xl bg-[#121215] border border-[#27272a] p-5 shadow-sm flex flex-col gap-3 text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#fafafa] pb-2 border-b border-[#27272a]/70">
                Trazabilidad de Cuenta
              </h3>
              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#71717a]">Creada:</span>
                  <span className="text-[#fafafa]">{formatDateTime(user.created_at, "-")}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#71717a]">Actualizada:</span>
                  <span className="text-[#fafafa]">{formatDateTime(user.updated_at, "-")}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#71717a]">Verificación email:</span>
                  <span className="text-[#34d399]">
                    {formatDateTime(user.email_verified_at, "Pendiente")}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#71717a]">Último acceso:</span>
                  <span className="text-[#fafafa]">{formatDateTime(user.last_login_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
