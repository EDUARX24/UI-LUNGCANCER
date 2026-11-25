import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield, KeyRound, RefreshCw, AlertCircle, Loader2, Users } from "lucide-react";
import { adminService } from "../services/admin.service";
import { extractApiError } from "@/lib/api/errors";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RolesPermissionsPage() {
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesSize, setRolesSize] = useState(10);
  const [permsPage, setPermsPage] = useState(1);
  const [permsSize, setPermsSize] = useState(10);

  const rolesQuery = useQuery({
    queryKey: ["admin-roles", { page: rolesPage, size: rolesSize }],
    queryFn: () => adminService.listRoles(rolesPage, rolesSize),
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions", { page: permsPage, size: permsSize }],
    queryFn: () => adminService.listPermissions(permsPage, permsSize),
  });

  const roles = rolesQuery.data?.data ?? [];
  const rolesTotal = rolesQuery.data?.total ?? 0;
  const permissions = permissionsQuery.data?.data ?? [];
  const permissionsTotal = permissionsQuery.data?.total ?? 0;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a1a1aa] font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span>SISTEMA</span>
          <span className="text-[#52525b]">/</span>
          <span>ACCESO &amp; IDENTIDAD</span>
          <span className="text-[#52525b]">/</span>
          <span className="text-[#a78bfa] font-medium">ROLES &amp; PERMISOS (RBAC)</span>
        </div>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-[#a78bfa]" />
          <span>Ir al Directorio Clínico &rarr;</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">
              Catálogo de Roles y Permisos RBAC
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#18181b] text-[#34d399] border border-[#27272a]">
              GET /roles · /permissions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a1a1aa]">
            Consulta los roles clínicos del sistema y los permisos granulares disponibles para
            control de acceso en el servidor FastAPI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            rolesQuery.refetch();
            permissionsQuery.refetch();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              rolesQuery.isFetching || permissionsQuery.isFetching
                ? "animate-spin text-[#a78bfa]"
                : "text-[#a1a1aa]"
            }`}
          />
          <span>Actualizar catálogos</span>
        </button>
      </div>

      {(rolesQuery.isError || permissionsQuery.isError) && (
        <Alert variant="destructive" className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
          <AlertDescription className="text-xs">
            {
              extractApiError(
                rolesQuery.error || permissionsQuery.error,
                "No se pudieron cargar los catálogos RBAC."
              ).message
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Two-column responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Roles Card */}
        <section className="rounded-xl border border-[#27272a] bg-[#0c0c0f] overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 sm:p-5 bg-[#121215]/70 border-b border-[#27272a] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#fafafa]">Roles Registrados</h2>
                <p className="text-[11px] font-mono text-[#71717a]">GET /api/v1/roles</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa]">
              {rolesTotal} roles
            </span>
          </div>

          {rolesQuery.isLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-xs font-mono text-[#a1a1aa]">
              <Loader2 className="w-4 h-4 animate-spin text-[#a78bfa]" />
              <span>Cargando roles...</span>
            </div>
          ) : roles.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#71717a]">No hay roles registrados.</p>
          ) : (
            <div className="divide-y divide-[#18181b]">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121215]/60 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#fafafa]">{role.name}</span>
                      <span className="px-2 py-0.5 rounded bg-[#121215] border border-[#a78bfa]/30 text-[#a78bfa] text-[10px] font-mono">
                        {role.code}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa]">
                      {role.description || "Sin descripción"}
                    </p>
                  </div>
                  <span
                    className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-mono border shrink-0 ${
                      role.is_system
                        ? "bg-[#065f46]/30 text-[#34d399] border-[#065f46]/50"
                        : "bg-[#18181b] text-[#a1a1aa] border-[#27272a]"
                    }`}
                  >
                    {role.is_system ? "Sistema" : "Personalizado"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <PaginationBar
            page={rolesPage}
            size={rolesSize}
            total={rolesTotal}
            itemLabel="roles"
            onPageChange={setRolesPage}
            onSizeChange={(newSize) => {
              setRolesSize(newSize);
              setRolesPage(1);
            }}
          />
        </section>

        {/* Permissions Card */}
        <section className="rounded-xl border border-[#27272a] bg-[#0c0c0f] overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 sm:p-5 bg-[#121215]/70 border-b border-[#27272a] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#34d399] shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#fafafa]">Permisos Granulares</h2>
                <p className="text-[11px] font-mono text-[#71717a]">GET /api/v1/permissions</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa]">
              {permissionsTotal} permisos
            </span>
          </div>

          {permissionsQuery.isLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-xs font-mono text-[#a1a1aa]">
              <Loader2 className="w-4 h-4 animate-spin text-[#a78bfa]" />
              <span>Cargando permisos...</span>
            </div>
          ) : permissions.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#71717a]">No hay permisos registrados.</p>
          ) : (
            <div className="divide-y divide-[#18181b]">
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#121215]/60 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#34d399]">
                      {perm.code}
                    </span>
                    <p className="text-xs text-[#a1a1aa]">
                      {perm.description || "Permiso del catálogo RBAC"}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717a] shrink-0">
                    ID: {perm.id.slice(0, 8)}...
                  </span>
                </div>
              ))}
            </div>
          )}

          <PaginationBar
            page={permsPage}
            size={permsSize}
            total={permissionsTotal}
            itemLabel="permisos"
            onPageChange={setPermsPage}
            onSizeChange={(newSize) => {
              setPermsSize(newSize);
              setPermsPage(1);
            }}
          />
        </section>
      </div>
    </div>
  );
}
