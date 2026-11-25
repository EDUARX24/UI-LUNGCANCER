import { useState } from "react";
import {
  Activity,
  Layers,
  Radio,
  Cpu,
  UserPlus,
  RotateCw,
  FileDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { InferencePerformanceChart } from "../components/InferencePerformanceChart";
import { StudiesQueueTable } from "../components/StudiesQueueTable";
import { InfrastructureStatusCard } from "../components/InfrastructureStatusCard";
import { AuditStreamCard } from "../components/AuditStreamCard";
import { InviteClinicianDialog } from "../components/InviteClinicianDialog";

export function AdminDashboardPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRestartingInference, setIsRestartingInference] = useState(false);

  const handleRestartInference = () => {
    setIsRestartingInference(true);
    toast.info("Enviando señal SIGHUP al cluster de inferencia PyTorch...");
    setTimeout(() => {
      setIsRestartingInference(false);
      toast.success("Workers de inferencia UNet 3D reiniciados con éxito.");
    }, 1200);
  };

  const handleExportAudit = () => {
    toast.success("Generando reporte de auditoría HIPAA/RGPD (PDF/CSV)...");
    setTimeout(() => {
      toast.info("Descarga iniciada: pulmoscan_audit_20261118.pdf");
    }, 800);
  };

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-8">
      {/* Top Command & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#fafafa]">
              Panel de Control de Administración Clínica
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-[#18181b] border border-[#27272a] text-[#34d399] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              ENLACE DICOM ACTIVO
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] max-w-2xl">
            Supervisión en tiempo real de nodos DICOM PACS, cola de inferencia de segmentación de
            nódulos y usuarios activos.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsInviteDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#fafafa] transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#a78bfa] shrink-0" />
            <span>+ Invitar Facultativo</span>
          </button>

          <button
            type="button"
            onClick={handleRestartInference}
            disabled={isRestartingInference}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#fafafa] transition-colors disabled:opacity-50"
          >
            <RotateCw
              className={`w-4 h-4 text-[#a1a1aa] shrink-0 ${
                isRestartingInference ? "animate-spin text-[#a78bfa]" : ""
              }`}
            />
            <span>Reiniciar Inferencia</span>
          </button>

          <button
            type="button"
            onClick={handleExportAudit}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span>Exportar Informe de Auditoría</span>
          </button>
        </div>
      </div>

      {/* Key Clinical KPIs (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Estudios Procesados */}
        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Estudios TC Procesados Hoy
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight text-[#fafafa]">1,428</span>
                <span className="text-xs font-mono text-[#34d399] flex items-center font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +12.4%
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 bg-[#09090b]/60 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-[#18181b]">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-[#71717a]">Precisión Inferencia</span>
              <span className="text-[#fafafa] font-semibold">99.4%</span>
            </div>
            <div className="w-full h-1 bg-[#18181b] rounded-full overflow-hidden">
              <div className="bg-[#a78bfa] h-full w-[99.4%]" />
            </div>
          </div>
        </div>

        {/* Card 2: Nódulos Detectados */}
        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Nódulos Detectados
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight text-[#fafafa]">384</span>
                <span className="text-xs font-mono text-[#71717a]">candidatos</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-[#09090b]/60 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-[#18181b] text-[11px] font-mono">
            <span className="text-[#ef4444] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              48 Malignidad &gt;65%
            </span>
            <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a78bfa] text-[10px]">
              PulmoSeg v4.2
            </span>
          </div>
        </div>

        {/* Card 3: Latencia PACS DICOM */}
        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Latencia Media PACS DICOM
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight text-[#fafafa]">18.2 ms</span>
                <span className="text-xs font-mono text-[#34d399] font-medium">4.8 Gbps</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#34d399]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-[#09090b]/60 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-[#18181b] text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 text-[#a1a1aa]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" /> 4 Nodos sincronizados
            </span>
            <span className="text-[#71717a] text-[10px]">C-MOVE / C-STORE</span>
          </div>
        </div>

        {/* Card 4: Carga GPU Cluster */}
        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                GPU Cluster (4x A100)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight text-[#fafafa]">68%</span>
                <span className="text-xs font-mono text-[#71717a]">320/500 GB VRAM</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-[#09090b]/60 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-[#18181b] text-[11px] font-mono">
            <span className="text-[#a1a1aa]">Temp 54°C · Normal</span>
            <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#34d399] text-[10px]">
              8 workers activos
            </span>
          </div>
        </div>
      </div>

      {/* Main Operational Grid (70% Left / 30% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* Left Column (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
          <InferencePerformanceChart />
          <StudiesQueueTable />
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-w-0">
          <InfrastructureStatusCard />
          <AuditStreamCard />
        </div>
      </div>

      {/* Clinician Invitation Dialog */}
      <InviteClinicianDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </div>
  );
}
