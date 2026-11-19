import { FileText, Download, ShieldCheck, Calendar, Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";

export function PatientStudiesPage() {
  const { user } = useAuth();

  const patientName = user?.first_name || user?.last_name
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Paciente";

  const handleDownloadReport = (studyId: string) => {
    toast.success(`Descargando informe médico en PDF para el estudio ${studyId}...`);
    setTimeout(() => {
      toast.info(`Archivo pulmoscan_informe_${studyId}.pdf listo.`);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
              Mis Estudios TC e Informes Clínicos
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-[#18181b] border border-[#27272a] text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              HISTORIAL SINCRONIZADO
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] max-w-2xl">
            Bienvenido/a, <strong className="text-[#fafafa]">{patientName}</strong>. Consulta tus
            exploraciones tomográficas de tórax y los informes diagnósticos emitidos por el equipo
            de Neumología y Radiología.
          </p>
        </div>
      </div>

      {/* Patient Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
              Estudios Realizados
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#fafafa]">2</span>
            <span className="text-[11px] text-[#34d399] font-mono">100% informados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
              Último Diagnóstico
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#fafafa]">
              14 Nov 2026
            </span>
            <span className="text-[11px] text-[#a1a1aa] font-mono">Dr. M. Soria (Neumología)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#34d399]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
              Próximo Control Anual
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#fafafa]">
              Noviembre 2027
            </span>
            <span className="text-[11px] text-[#71717a] font-mono">Protocolo Preventivo</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Studies List */}
      <div className="rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 bg-[#121215]/60 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a78bfa]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#fafafa]">
                Exploraciones Tomográficas de Tórax
              </h2>
              <p className="text-[11px] text-[#71717a] font-mono">
                Imágenes DICOM y documentación médica oficial firmada electrónicamente
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#18181b]">
          {/* Study 1 */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121215]/50 transition-colors">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-medium text-[#a78bfa]">
                  TC-2024-8898
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#065f46]/30 text-[#34d399] border border-[#065f46]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                  Informe Validado
                </span>
              </div>
              <span className="text-xs text-[#fafafa] font-medium">
                TC Tórax Baja Dosis (320 cortes axiales) · Hospital Clínico San Carlos
              </span>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Conclusión clínica:{" "}
                <span className="text-[#34d399]">
                  Sin nódulos pulmonares sospechosos &gt;4mm. Parénquima pulmonar y vía aérea
                  normales.
                </span>
              </p>
              <span className="text-[10px] text-[#71717a] font-mono mt-1">
                Fecha del estudio: 14 de Noviembre de 2026 · Facultativo responsable: Dr. M. Soria
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleDownloadReport("TC-2024-8898")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Informe (PDF)</span>
              </button>
            </div>
          </div>

          {/* Study 2 */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121215]/50 transition-colors">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-medium text-[#a78bfa]">
                  TC-2024-7102
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                  Histórico
                </span>
              </div>
              <span className="text-xs text-[#fafafa] font-medium">
                TC Tórax Screening Anual (280 cortes) · Hospital Clínico San Carlos
              </span>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Conclusión clínica: Estudio comparativo estable. Sin lesiones de nuevo desarrollo.
              </p>
              <span className="text-[10px] text-[#71717a] font-mono mt-1">
                Fecha del estudio: 12 de Mayo de 2026 · Facultativo responsable: Dra. A. Valero
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleDownloadReport("TC-2024-7102")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-[#a1a1aa]" />
                <span>Descargar Informe (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & HIPAA Notice */}
      <div className="p-4 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#18181b] text-[#34d399]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#fafafa]">
            Privacidad y Confidencialidad de tus Datos de Salud (RGPD / HIPAA)
          </span>
          <span className="text-[11px] text-[#71717a]">
            Todas tus imágenes radiológicas y diagnósticos están almacenados bajo cifrado AES-256
            y firma biométrica. Solo tú y el equipo médico facultativo autorizado tienen acceso.
          </span>
        </div>
      </div>
    </div>
  );
}
