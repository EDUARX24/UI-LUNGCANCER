import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Search,
  FilterX,
  RefreshCw,
  Shield,
  History,
  AlertCircle,
  Loader2,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/auth.service";
import { adminService } from "../services/admin.service";
import type { UpdatableUserStatus, UserAccountStatus } from "../types";
import { extractApiError } from "@/lib/api/errors";
import { formatDateTime, getInitials } from "@/lib/formatters";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { InviteClinicianDialog } from "../components/InviteClinicianDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function UsersDirectoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserAccountStatus | "">("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Debounce search input to avoid flooding GET /api/v1/users on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: ["admin-users", { page, size, status: statusFilter, role: roleFilter, search: debouncedSearch }],
    queryFn: () =>
      adminService.listUsers({
        page,
        size,
        status: statusFilter,
        role: roleFilter,
        search: debouncedSearch,
      }),
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-roles-catalog"],
    queryFn: () => adminService.listRoles(1, 50),
    staleTime: 5 * 60 * 1000,
  });

  const readinessQuery = useQuery({
    queryKey: ["api-readiness"],
    queryFn: () => authService.checkReadiness(),
    retry: false,
    staleTime: 60 * 1000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UpdatableUserStatus }) =>
      adminService.updateUserStatus(userId, { status }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        `Estado de ${updatedUser.first_name} ${updatedUser.last_name} actualizado a "${updatedUser.status}".`
      );
    },
    onError: (err) => {
      const parsed = extractApiError(err, "No se pudo actualizar el estado del usuario.");
      toast.error(parsed.message);
    },
  });

  const users = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.total ?? 0;
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const restrictedCount = users.filter(
    (u) => u.status === "suspended" || u.status === "disabled"
  ).length;

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Top Breadcrumb & API Readiness Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a1a1aa] font-mono">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span>SISTEMA</span>
          <span className="text-[#52525b]">/</span>
          <span>ACCESO &amp; IDENTIDAD</span>
          <span className="text-[#52525b]">/</span>
          <span className="text-[#a78bfa] font-medium">DIRECTORIO CLÍNICO</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#a1a1aa]">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                readinessQuery.isError ? "bg-[#ef4444]" : "bg-[#34d399]"
              }`}
            />
            DB READY:{" "}
            {readinessQuery.isLoading
              ? "VERIFICANDO..."
              : readinessQuery.isError
              ? "NO DISPONIBLE"
              : (readinessQuery.data?.status || "READY").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-1">
        <div className="flex flex-col gap-2 max-w-3xl min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
              Directorio de Usuarios Clínicos
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#18181b] text-[#a78bfa] border border-[#27272a]">
              v2.4 RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            Gestión centralizada de facultativos, cuentas médicas y estado operativo en el nodo
            hospitalario. Control estricto de roles y permisos de acceso.
          </p>

          {/* Status Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121215] border border-[#27272a] text-xs font-mono text-[#a1a1aa]">
              <span className="text-[#71717a]">Total:</span>
              <span className="font-semibold text-[#fafafa]">{total} usuarios</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121215] border border-[#27272a] text-xs font-mono text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>{activeCount} activos (vista)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121215] border border-[#27272a] text-xs font-mono text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{pendingCount} pendientes (vista)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121215] border border-[#27272a] text-xs font-mono text-[#fca5a5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              <span>{restrictedCount} restringidos (vista)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/roles"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#fafafa] text-xs font-medium transition-colors"
          >
            <Shield className="w-4 h-4 text-[#a78bfa]" />
            <span>Roles &amp; Permisos</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Invitar Facultativo</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-2.5 flex flex-col md:flex-row md:items-center gap-2.5 w-full shadow-sm">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar usuarios por nombre o correo"
            placeholder="Buscar por nombre, apellidos o correo institucional..."
            className="w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg pl-9 pr-3 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por rol"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none bg-[#121215] hover:bg-[#18181b] text-xs text-[#fafafa] border border-[#27272a] rounded-lg px-3 py-2 focus:outline-none focus:border-[#a78bfa] cursor-pointer"
          >
            <option value="">Rol: Todos</option>
            {(rolesQuery.data?.data ?? []).map((r) => (
              <option key={r.id} value={r.code}>
                Rol: {r.code}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserAccountStatus | "");
              setPage(1);
            }}
            className="flex-1 sm:flex-none bg-[#121215] hover:bg-[#18181b] text-xs text-[#fafafa] border border-[#27272a] rounded-lg px-3 py-2 focus:outline-none focus:border-[#a78bfa] cursor-pointer"
          >
            <option value="">Estado: Todos</option>
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="suspended">Suspendido</option>
            <option value="disabled">Deshabilitado</option>
          </select>

          <div className="flex items-center gap-1.5 sm:border-l sm:border-[#27272a] sm:pl-2">
            <button
              type="button"
              onClick={handleResetFilters}
              title="Restablecer filtros"
              aria-label="Restablecer filtros"
              className="p-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
            >
              <FilterX className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              title="Actualizar datos"
              aria-label="Actualizar datos"
              className="p-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${usersQuery.isFetching ? "animate-spin text-[#a78bfa]" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {usersQuery.isError && (
        <Alert variant="destructive" className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
          <AlertDescription className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              {extractApiError(usersQuery.error, "No se pudo cargar el directorio de usuarios.").message}
            </span>
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="underline font-medium text-[#fafafa] self-start sm:self-auto"
            >
              Reintentar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Users Table Container (Cards on < md, Data Table on md+) */}
      <div className="w-full overflow-hidden rounded-xl border border-[#27272a] bg-[#0c0c0f] shadow-sm flex flex-col">
        {usersQuery.isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#a1a1aa]">
            <Loader2 className="w-6 h-6 animate-spin text-[#a78bfa]" />
            <span>Cargando directorio de usuarios clínicos...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
            <Users className="w-8 h-8 text-[#52525b]" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#fafafa]">
                No se encontraron usuarios con los filtros aplicados
              </p>
              <p className="text-xs text-[#71717a]">
                Prueba limpiando la búsqueda o invita a un nuevo facultativo.
              </p>
            </div>
            {(debouncedSearch || roleFilter || statusFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs text-[#fafafa] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="md:overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-[#121215]/80 text-[11px] uppercase tracking-wider text-[#a1a1aa] font-medium border-b border-[#27272a]">
                  <th className="px-4 py-3 font-medium">Facultativo / Identificación</th>
                  <th className="px-4 py-3 font-medium">Roles Asignados</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Último Acceso</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-[#18181b]">
                {users.map((u) => {
                  const fullName = `${u.first_name} ${u.last_name}`.trim() || u.email;
                  const initials = getInitials(u.first_name, u.last_name, u.email);
                  const isSelf = currentUser?.id === u.id;
                  const isSuspendedOrDisabled =
                    u.status === "suspended" || u.status === "disabled";

                  return (
                    <tr
                      key={u.id}
                      className="block md:table-row p-4 md:p-0 space-y-3 md:space-y-0 hover:bg-[#121215]/80 transition-colors"
                    >
                      {/* User Identity */}
                      <td className="block md:table-cell md:px-4 md:py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 border ${
                              u.roles.includes("ADMIN")
                                ? "bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30"
                                : u.status === "pending"
                                ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                                : "bg-[#18181b] text-[#fafafa] border-[#27272a]"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[#fafafa] text-xs truncate">
                                {fullName}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30 uppercase">
                                  Tú
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#a1a1aa] truncate">{u.email}</span>
                            <span className="text-[10px] font-mono text-[#71717a] truncate">
                              ID: {u.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3.5">
                        <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a] shrink-0">
                          Roles
                        </span>
                        <div className="flex flex-wrap items-center justify-end md:justify-start gap-1">
                          {u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                                  r === "ADMIN"
                                    ? "bg-[#121215] border-[#a78bfa]/40 text-[#a78bfa]"
                                    : "bg-[#121215] border-[#27272a] text-[#a1a1aa]"
                                }`}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] font-mono text-[#71717a]">Sin roles</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3.5">
                        <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                          Estado
                        </span>
                        <UserStatusBadge status={u.status} />
                      </td>

                      {/* Last Login */}
                      <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3.5">
                        <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                          Último acceso
                        </span>
                        <div className="flex flex-col text-right md:text-left">
                          <span className="text-[#fafafa] font-mono text-[11px]">
                            {formatDateTime(u.last_login_at)}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717a]">
                            Alta: {formatDateTime(u.created_at, "-")}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="flex items-center justify-between gap-2 pt-2 border-t border-[#18181b] md:border-t-0 md:pt-3.5 md:table-cell md:px-4 md:py-3.5 md:text-right">
                        <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                          Acciones
                        </span>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-xs font-medium text-[#fafafa] transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#a78bfa]" />
                            <span>Ver exp.</span>
                          </button>

                          {!isSelf && isSuspendedOrDisabled && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() =>
                                statusMutation.mutate({ userId: u.id, status: "active" })
                              }
                              className="px-2.5 py-1 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#34d399]/30 text-xs font-medium text-[#34d399] transition-colors whitespace-nowrap disabled:opacity-50"
                            >
                              Reactivar
                            </button>
                          )}

                          {!isSelf && u.status === "active" && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() =>
                                statusMutation.mutate({ userId: u.id, status: "suspended" })
                              }
                              className="px-2.5 py-1 rounded-md bg-[#121215] hover:bg-[#3b1111]/40 border border-[#ef4444]/30 text-xs font-medium text-[#fca5a5] transition-colors whitespace-nowrap disabled:opacity-50"
                            >
                              Suspender
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <PaginationBar
          page={page}
          size={size}
          total={total}
          itemLabel="usuarios"
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setSize(newSize);
            setPage(1);
          }}
        />
      </div>

      {/* Compliance Footer Micro-Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#0c0c0f] border border-[#27272a] text-xs text-[#a1a1aa] font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-4 h-4 text-[#34d399] shrink-0" />
          <span>
            Cumplimiento RGPD Sanitario / HIPAA: Cambios de estado y roles quedan registrados en
            auditoría inmutable.
          </span>
        </div>
        <Link
          to="/admin/audit"
          className="inline-flex items-center gap-1.5 text-[#a78bfa] hover:text-[#c4b5fd] hover:underline shrink-0"
        >
          <History className="w-3.5 h-3.5" />
          <span>Ver auditoría</span>
        </Link>
      </div>

      <InviteClinicianDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvited={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
      />
    </div>
  );
}
