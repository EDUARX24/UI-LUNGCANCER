import { useState } from "react";
import { Eye, MoreVertical, RotateCw, StopCircle, ArrowUpRight, AlertTriangle, Layers } from "lucide-react";
import { toast } from "sonner";
import type { CTStudy } from "../types";

const INITIAL_STUDIES: CTStudy[] = [
  {
    id: "TC-2024-8901",
    patientNhc: "NHC-***9421",
    patientAge: 62,
    patientGender: "H",
    modality: "TC Tórax Alta Res.",
    slices: 512,
    department: "Neumología",
    status: "COMPLETED",
    findings: {
      severity: "CRITICAL",
      description: "2 Nódulos (LID 12mm)",
    },
  },
  {
    id: "TC-2024-8902",
    patientNhc: "NHC-***4108",
    patientAge: 48,
    patientGender: "M",
    modality: "Angio-TC Pulmonar",
    slices: 680,
    department: "Urgencias",
    status: "PROCESSING",
    progress: 64,
    findings: {
      severity: "PENDING",
      description: "Procesando Voxel...",
    },
  },
  {
    id: "TC-2024-8898",
    patientNhc: "NHC-***1120",
    patientAge: 55,
    patientGender: "H",
    modality: "TC Tórax Baja Dosis",
    slices: 320,
    department: "Oncología Médica",
    status: "COMPLETED",
    findings: {
      severity: "BENIGN",
      description: "Sin hallazgos >4mm",
    },
  },
  {
    id: "TC-2024-8903",
    patientNhc: "NHC-***7834",
    patientAge: 71,
    patientGender: "M",
    modality: "TC Screening Pulmonar",
    slices: 440,
    department: "Neumología",
    status: "QUEUED",
    findings: {
      severity: "PENDING",
      description: "En espera de worker",
    },
  },
  {
    id: "TC-2024-8896",
    patientNhc: "NHC-***3091",
    patientAge: 64,
    patientGender: "H",
    modality: "TC Tórax Alta Res.",
    slices: 512,
    department: "Cirugía Torácica",
    status: "COMPLETED",
    findings: {
      severity: "INTERMEDIATE",
      description: "1 Nódulo Subsólido (LSI 6mm)",
    },
  },
];

export function StudiesQueueTable() {
  const [studies] = useState<CTStudy[]>(INITIAL_STUDIES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Cola de estudios sincronizada con nodo PACS");
    }, 600);
  };

  return (
    <div className="rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215]/60 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-[#fafafa]">
              Cola de Estudios TC en Tiempo Real
            </h2>
            <p className="text-[11px] text-[#71717a] font-mono">
              Transmisiones activas desde PACS Clínico (Orthanc DICOM)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa] font-mono text-[11px]">
            5 en procesamiento
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            title="Sincronizar Cola PACS"
            aria-label="Sincronizar Cola PACS"
            className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors border border-[#27272a]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#a78bfa]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table (Stacked cards on mobile < md, Data table on md+) */}
      <div className="md:overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="bg-[#09090b] text-[10px] font-mono uppercase tracking-wider text-[#71717a] border-b border-[#27272a]">
              <th className="py-3 px-4 font-medium">ID Estudio</th>
              <th className="py-3 px-4 font-medium">Paciente (Anonimizado)</th>
              <th className="py-3 px-4 font-medium">Modalidad & Cortes</th>
              <th className="py-3 px-4 font-medium">Servicio</th>
              <th className="py-3 px-4 font-medium">Estado IA</th>
              <th className="py-3 px-4 font-medium">Hallazgos</th>
              <th className="py-3 px-4 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group divide-y divide-[#18181b] font-sans">
            {studies.map((study) => (
              <tr
                key={study.id}
                className="block md:table-row p-4 md:p-0 space-y-2.5 md:space-y-0 hover:bg-[#121215]/80 transition-colors"
              >
                {/* ID */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4 font-mono font-medium text-[#a78bfa]">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    ID Estudio
                  </span>
                  <span>{study.id}</span>
                </td>

                {/* Patient */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    Paciente
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-end md:justify-start">
                    <span className="font-mono text-[#fafafa] font-medium">
                      {study.patientNhc}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                      {study.patientAge}a · {study.patientGender}
                    </span>
                  </div>
                </td>

                {/* Modality & Slices */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4 text-[#a1a1aa]">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a] shrink-0">
                    Modalidad
                  </span>
                  <span className="text-right md:text-left">
                    {study.modality}{" "}
                    <span className="font-mono text-[#71717a]">({study.slices} c)</span>
                  </span>
                </td>

                {/* Department */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    Servicio
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#18181b] border border-[#27272a] text-[#fafafa]">
                    {study.department}
                  </span>
                </td>

                {/* AI Status */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    Estado IA
                  </span>
                  <div>
                    {study.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#065f46]/30 text-[#34d399] border border-[#065f46]/50 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                        Completado
                      </span>
                    )}
                    {study.status === "PROCESSING" && (
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between text-[10px] font-mono text-[#a78bfa]">
                          <span>Segmentando</span>
                          <span>{study.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#18181b] rounded-full overflow-hidden">
                          <div
                            className="bg-[#a78bfa] h-full animate-pulse"
                            style={{ width: `${study.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {study.status === "QUEUED" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#18181b] border border-[#27272a] text-[#71717a] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]" />
                        En Cola (#2)
                      </span>
                    )}
                  </div>
                </td>

                {/* Findings */}
                <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:px-4">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a] shrink-0">
                    Hallazgos
                  </span>
                  <div className="text-right md:text-left">
                    {study.findings.severity === "CRITICAL" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#ef4444] bg-[#3b1111]/40 border border-[#ef4444]/30 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-[#ef4444] shrink-0" />
                        {study.findings.description}
                      </span>
                    )}
                    {study.findings.severity === "BENIGN" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#34d399] bg-[#065f46]/30 border border-[#065f46]/40 px-2 py-0.5 rounded">
                        {study.findings.description}
                      </span>
                    )}
                    {study.findings.severity === "INTERMEDIATE" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a78bfa] bg-[#7c3aed]/20 border border-[#7c3aed]/30 px-2 py-0.5 rounded">
                        {study.findings.description}
                      </span>
                    )}
                    {study.findings.severity === "PENDING" && (
                      <span className="text-[#71717a] font-mono text-[11px]">
                        {study.findings.description}
                      </span>
                    )}
                  </div>
                </td>

                {/* Action */}
                <td className="flex items-center justify-between gap-2 pt-2 border-t border-[#18181b]/70 md:border-t-0 md:pt-3 md:table-cell md:py-3 md:px-4 md:text-right">
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    Acciones
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    {study.status === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(`Abriendo visor 3D para el estudio ${study.id}`)
                        }
                        className="p-1.5 md:p-1 rounded hover:bg-[#18181b] text-[#a78bfa] transition-colors"
                        title="Visor DICOM 3D"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {study.status === "PROCESSING" && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.warning(`Inferencia detenida para el estudio ${study.id}`)
                        }
                        className="p-1.5 md:p-1 rounded hover:bg-[#18181b] text-[#ef4444] transition-colors"
                        title="Cancelar Inferencia"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    )}
                    {study.status === "QUEUED" && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`Estudio ${study.id} priorizado al inicio de cola`)
                        }
                        className="p-1.5 md:p-1 rounded hover:bg-[#18181b] text-[#34d399] transition-colors"
                        title="Priorizar Inferencia"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(`Detalles técnicos de metadatos DICOM para ${study.id}`)
                      }
                      className="p-1.5 md:p-1 rounded hover:bg-[#18181b] text-[#71717a] hover:text-[#fafafa] transition-colors"
                      title="Opciones de estudio"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 sm:px-4 bg-[#09090b] border-t border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#71717a] font-mono">
        <span>Mostrando 5 de 42 estudios en memoria intermedia</span>
        <button
          type="button"
          onClick={() => toast.info("Navegando a la vista completa de Gestión de Estudios TC")}
          className="text-[#a78bfa] hover:text-[#c4b5fd] hover:underline flex items-center gap-1 font-sans transition-colors self-start sm:self-auto"
        >
          <span>Ver todos los estudios</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
