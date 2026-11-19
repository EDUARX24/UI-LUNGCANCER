import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { 
  Activity, 
  LayoutDashboard, 
  Layers, 
  Radio, 
  Users, 
  Terminal, 
  Search, 
  Bell, 
  LogOut, 
  Building2, 
  ChevronDown, 
  User as UserIcon,
  ShieldCheck,
  FileText
} from "lucide-react";
import { toast } from "sonner";

export function ClinicalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isPatient = user?.roles?.includes("PATIENT");
  const isAdmin = user?.roles?.includes("ADMIN");
  const isRadiologist = user?.roles?.includes("RADIOLOGIST");

  const portalSubtitle = isPatient
    ? "Portal del Paciente"
    : isAdmin
    ? "Admin Console"
    : isRadiologist
    ? "Estación Radiológica"
    : "Estación Clínica";

  const handleLogoutClick = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
    } finally {
      navigate("/login");
    }
  };

  const displayName = user?.first_name || user?.last_name
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || (isPatient ? "Paciente" : "Facultativo");

  const primaryRole = user?.roles?.[0] || (isPatient ? "PATIENT" : "ESPECIALISTA");

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex font-sans antialiased selection:bg-[#a78bfa]/25 selection:text-[#c4b5fd]">
      {/* Sidebar (Desktop w-72) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#0c0c0f] border-r border-[#27272a] z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#27272a] bg-[#09090b]/60">
            <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#fafafa] truncate">
                  PulmoScan <span className="text-[#a78bfa]">AI</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#18181b] text-[#a78bfa] border border-[#27272a]">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#a1a1aa] truncate uppercase tracking-wider">
                {portalSubtitle}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3">
            {isPatient ? (
              /* Patient Navigation */
              <>
                <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                  Servicios del Paciente
                </div>
                <nav className="flex flex-col gap-1">
                  <NavLink
                    to="/my-studies"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                  >
                    <FileText className="w-4 h-4 text-[#a78bfa]" />
                    <span>Mis Estudios e Informes TC</span>
                  </NavLink>

                  <NavLink
                    to="/session"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                  >
                    <Terminal className="w-4 h-4 text-[#34d399]" />
                    <span>Mi Perfil & Seguridad</span>
                  </NavLink>
                </nav>
              </>
            ) : (
              /* Clinician / Admin Navigation */
              <>
                <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                  Módulos Clínicos
                </div>
                <nav className="flex flex-col gap-1">
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#a78bfa]" />
                    <span>Panel Principal</span>
                  </NavLink>

                  <NavLink
                    to="/studies"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Módulo de Gestión de Estudios TC disponible en la siguiente fase.");
                    }}
                  >
                    <Layers className="w-4 h-4 text-[#71717a]" />
                    <span>Gestión de Estudios TC</span>
                  </NavLink>

                  <NavLink
                    to="/segmentation"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Visor de Segmentación IA 3D en preparación.");
                    }}
                  >
                    <Activity className="w-4 h-4 text-[#71717a]" />
                    <span>Segmentación IA & Modelos</span>
                  </NavLink>

                  {isAdmin && (
                    <>
                      <NavLink
                        to="/pacs"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                              : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                          }`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info("Configurador de Nodos PACS Orthanc / DICOM 3.0 en preparación.");
                        }}
                      >
                        <Radio className="w-4 h-4 text-[#71717a]" />
                        <span>Nodos PACS / DICOM</span>
                      </NavLink>

                      <NavLink
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-xs rounded-lg text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa] transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#71717a]" />
                        <span>Usuarios & Roles Clínicos</span>
                      </NavLink>
                    </>
                  )}

                  <NavLink
                    to="/session"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#18181b] text-[#fafafa] border-l-2 border-[#a78bfa]"
                          : "text-[#a1a1aa] hover:bg-[#121215] hover:text-[#fafafa]"
                      }`
                    }
                  >
                    <Terminal className="w-4 h-4 text-[#34d399]" />
                    <span>Sesión Técnica (JWT/CSRF)</span>
                  </NavLink>
                </nav>
              </>
            )}
          </div>
        </div>

        {/* Bottom Hardware Telemetry (Hidden for Patient) */}
        {!isPatient ? (
          <div className="p-3 border-t border-[#27272a] bg-[#09090b]/80">
            <div className="p-3 rounded-xl bg-[#121215] border border-[#27272a] flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa]">
                  Telemetría Nodo
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#34d399] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                  A100 ON
                </span>
              </div>

              {/* CPU Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#71717a]">CPU EPYC</span>
                  <span className="text-[#fafafa] font-medium">28%</span>
                </div>
                <div className="w-full h-1 bg-[#18181b] rounded-full overflow-hidden">
                  <div className="bg-[#a78bfa] h-full w-[28%]" />
                </div>
              </div>

              {/* VRAM Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#71717a]">VRAM GPU</span>
                  <span className="text-[#fafafa] font-medium">64% (51.2 GB)</span>
                </div>
                <div className="w-full h-1 bg-[#18181b] rounded-full overflow-hidden">
                  <div className="bg-[#34d399] h-full w-[64%]" />
                </div>
              </div>

              <div className="text-[9px] text-[#71717a] font-mono truncate pt-0.5 border-t border-[#27272a]/60">
                Cluster GPU A100 · 4/4 Nodos OK
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-[#27272a] bg-[#09090b]/80">
            <div className="p-3 rounded-xl bg-[#121215] border border-[#27272a] flex items-center gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#34d399] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-[#fafafa] truncate">
                  Cifrado E2EE Activo
                </span>
                <span className="text-[10px] text-[#71717a] font-mono truncate">
                  Historial Médico Protegido
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area (Offset by 72 = 18rem) */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 h-16 bg-[#0c0c0f]/90 backdrop-blur-xl border-b border-[#27272a] px-6 flex items-center justify-between gap-4">
          {/* Left Context: Hospital Selector & PACS Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-[#a1a1aa]">
              <Building2 className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-[#fafafa] font-medium truncate max-w-xs">
                {isPatient
                  ? "Hospital Clínico San Carlos · Portal del Paciente"
                  : "Hospital Clínico San Carlos · Nodo DICOM Principal"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[10px] font-mono text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>{isPatient ? "CONEXIÓN SEGURA · TLS 1.3" : "PACS ONLINE · TLS 1.3"}</span>
            </div>
          </div>

          {/* Right Context: Search, Bell, Profile, Logout */}
          <div className="flex items-center gap-3">
            {/* Quick search */}
            <div className="relative w-64 hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isPatient ? "Buscar en mis informes o citas..." : "Buscar estudios, radiólogos, nodos..."}
                className="w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg pl-9 pr-3 py-1.5 border border-[#27272a] focus:outline-none focus:border-[#a78bfa] transition-colors"
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Ver notificaciones clínicas"
              className="relative p-2 rounded-lg bg-[#121215] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors"
              onClick={() => toast.info("No hay alertas clínicas no leídas.")}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#a78bfa]" />
            </button>

            <div className="h-5 w-px bg-[#27272a]" />

            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa]/40 flex items-center justify-center text-[#a78bfa]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-medium text-[#fafafa] leading-tight truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#a1a1aa] font-mono leading-tight">
                  {primaryRole}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogoutClick}
                aria-label="Cerrar sesión"
                className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#3b1111]/30 border border-transparent hover:border-[#ef4444]/30 transition-colors ml-1"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Main Body */}
        <main className="flex-1 w-full bg-[#09090b] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
