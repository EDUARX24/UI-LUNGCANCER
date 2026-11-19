import { History, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function AuditStreamCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col gap-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#a78bfa]" />
            <h3 className="text-xs font-semibold tracking-tight text-[#fafafa] uppercase font-mono">
              Registro Clínico & Alertas
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#71717a]">Stream live</span>
        </div>

        {/* Timeline Events */}
        <div className="flex flex-col gap-3.5 relative">
          {/* Vertical Guide */}
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-[#18181b]" />

          {/* Event 1: Clinical Validation */}
          <div className="flex items-start gap-3 relative pl-6">
            <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#34d399]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#fafafa] leading-tight">
                <span className="font-medium text-[#a78bfa]">Dr. M. Soria</span> validó informe{" "}
                <span className="font-mono text-[#71717a]">TC-8894</span> (Neumología)
              </p>
              <span className="text-[10px] font-mono text-[#71717a]">
                hace 3 min · Firma biométrica OK
              </span>
            </div>
          </div>

          {/* Event 2: Critical Detection */}
          <div className="flex items-start gap-3 relative pl-6">
            <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
            <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#ef4444]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#fafafa] leading-tight">
                <span className="text-[#ef4444] font-medium">Alerta Crítica:</span> Nódulo &gt;8mm
                espiculado en <span className="font-mono text-[#71717a]">TC-8899</span>
              </p>
              <span className="text-[10px] font-mono text-[#ef4444]/80">
                hace 11 min · Notificado a Comité
              </span>
            </div>
          </div>

          {/* Event 3: PACS Reconnect */}
          <div className="flex items-start gap-3 relative pl-6">
            <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#71717a]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#fafafa] leading-tight">
                Nodo PACS Urgencias reconectado automáticamente tras keep-alive.
              </p>
              <span className="text-[10px] font-mono text-[#71717a]">
                hace 24 min · TLS Handshake OK
              </span>
            </div>
          </div>

          {/* Event 4: Incremental Backup */}
          <div className="flex items-start gap-3 relative pl-6">
            <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-[#71717a]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#fafafa] leading-tight">
                Backup incremental de metadatos DICOM completado con éxito.
              </p>
              <span className="text-[10px] font-mono text-[#71717a]">
                hace 1h · Snapshot #4029
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => toast.info("Exportando registro completo de auditoría y trazas HIPAA...")}
          className="w-full py-2 text-center text-xs text-[#a1a1aa] hover:text-[#fafafa] bg-[#09090b] rounded-lg hover:bg-[#18181b] border border-[#27272a] transition-colors font-mono"
        >
          Ver Log Completo de Seguridad
        </button>
      </div>

      {/* C-ECHO Diagnostic Sweep Banner */}
      <div className="p-4 rounded-xl bg-[#0c0c0f] border-l-2 border-[#a78bfa] border border-y-[#27272a] border-r-[#27272a] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-[#fafafa] font-semibold">
            C-ECHO Diagnostic Sweep
          </span>
          <span className="text-[10px] text-[#71717a]">
            Todos los 4 Nodos DICOM respondieron en &lt;20ms
          </span>
        </div>
        <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
      </div>
    </div>
  );
}
