import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function ForbiddenPage() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center py-8">
      <div className="w-full bg-[#121215] border border-[#ef4444]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#3b1111]/40 border border-[#ef4444]/50 flex items-center justify-center text-[#ef4444] shadow-lg">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono text-[#ef4444] uppercase tracking-widest">
            ERROR 403 // ACCESO DENEGADO
          </span>
          <h1 className="text-xl font-bold text-[#fafafa]">
            Permisos Clínicos Insuficientes
          </h1>
        </div>

        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Tu rol de usuario actual no dispone de los privilegios necesarios para acceder a este recurso médico o visor radiológico.
        </p>

        <div className="pt-2">
          <Link
            to="/session"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-mono border border-[#27272a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Sesión Técnica</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
