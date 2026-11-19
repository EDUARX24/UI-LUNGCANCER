import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, Activity, Lock } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-[#a78bfa]/25 selection:text-[#c4b5fd] overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.12),rgba(9,9,11,0))]" 
      />
      <div 
        aria-hidden="true" 
        className="fixed -top-40 -right-40 w-96 h-96 bg-[#a78bfa]/8 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="fixed -bottom-40 -left-40 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-3xl pointer-events-none" 
      />

      {/* Header bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-[#27272a]/40 bg-[#09090b]/60 backdrop-blur-md">
        <Link to="/login" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#a78bfa]">
          <div className="h-9 w-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shadow-sm group-hover:border-[#a78bfa]/50 transition-colors">
            <Activity className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-[#fafafa]">
                PulmoScan <span className="text-[#a78bfa]">AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-[#71717a] font-mono">
              Plataforma de Segmentación Pulmonar TC
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121215] border border-[#27272a] text-[#a1a1aa]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-[11px]">PACS Online</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121215] border border-[#27272a] text-[#71717a]">
            <Lock className="w-3 h-3 text-[#a78bfa]" />
            <span className="text-[11px]">TLS 1.3</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Global Clinical Compliance Footer */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-[#27272a]/40 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
            <span className="font-mono uppercase tracking-wider text-[10px] text-[#a1a1aa]">
              Entorno Clínico Certificado · RGPD / HIPAA Nivel 4
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>TC-DICOM Estación IA</span>
            <span className="text-[#3f3f46]">·</span>
            <span className="text-[#a1a1aa]">Render API: Conectada</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
