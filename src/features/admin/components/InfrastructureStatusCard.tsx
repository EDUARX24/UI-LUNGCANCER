import { Server, HardDrive, ShieldCheck, Cpu } from "lucide-react";

export function InfrastructureStatusCard() {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="w-4 h-4 text-[#a78bfa] shrink-0" />
          <h3 className="text-xs font-semibold tracking-tight text-[#fafafa] uppercase font-mono truncate">
            Infraestructura & Servicios DICOM
          </h3>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shrink-0" />
      </div>

      <div className="flex flex-col gap-3">
        {/* Item 1: Central PACS */}
        <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded bg-[#18181b] text-[#a78bfa] mt-0.5 shrink-0">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-[#fafafa] truncate">
                PACS Central Hospitalario
              </span>
              <span className="text-[10px] font-mono text-[#71717a] truncate">
                dcmtk / Orthanc AE: HOSP_PACS
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono text-[#34d399] font-medium">
              CONECTADO
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">Ping 4ms</span>
          </div>
        </div>

        {/* Item 2: PyTorch / TorchServe Motor */}
        <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded bg-[#18181b] text-[#34d399] mt-0.5 shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-[#fafafa] truncate">
                Motor ResNet-UNet 3D
              </span>
              <span className="text-[10px] font-mono text-[#71717a] truncate">
                TorchServe PyTorch · GPU 1-4
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono text-[#34d399] font-medium">
              OPERATIVO
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">0 err / 24h</span>
          </div>
        </div>

        {/* Item 3: GDPR Anonymizer */}
        <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded bg-[#18181b] text-[#a78bfa] mt-0.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-[#fafafa] truncate">
                Filtro Anonimizador RGPD/HIPAA
              </span>
              <span className="text-[10px] font-mono text-[#71717a] truncate">
                SHA-256 Hash Salted
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono text-[#34d399] font-medium">
              ACTIVO
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">100% blindado</span>
          </div>
        </div>

        {/* Item 4: NVMe Storage */}
        <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex flex-col gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded bg-[#18181b] text-[#a78bfa] mt-0.5 shrink-0">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-wrap justify-between items-center gap-1 w-full text-xs min-w-0">
              <span className="font-medium text-[#fafafa] truncate">
                Almacenamiento NVMe Tier-1
              </span>
              <span className="font-mono text-[11px] text-[#a1a1aa] shrink-0">
                29.6 TB / 40 TB
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden">
            <div className="bg-[#a78bfa] h-full w-[74%]" />
          </div>

          <div className="flex flex-wrap justify-between gap-1 text-[10px] font-mono text-[#71717a]">
            <span>74% Utilizado</span>
            <span>10.4 TB libres (~12 días)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
