import { useState } from "react";
import { TrendingUp } from "lucide-react";

export function InferencePerformanceChart() {
  const [range, setRange] = useState<"today" | "7d" | "30d">("today");

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-[#0c0c0f] border border-[#27272a] flex flex-col gap-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#a78bfa] shrink-0" />
            <h2 className="text-sm font-semibold tracking-tight text-[#fafafa]">
              Rendimiento de Inferencia & Volumen TC (Últimas 24h)
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] font-mono">
            Tiempo promedio de inferencia:{" "}
            <span className="text-[#34d399] font-semibold">3.2 seg</span> por volumen TC 3D
            completo
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRange("today")}
            className={`px-3 py-1 rounded transition-colors ${
              range === "today"
                ? "bg-[#18181b] text-[#fafafa] font-medium border border-[#27272a]"
                : "text-[#71717a] hover:text-[#fafafa]"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setRange("7d")}
            className={`px-3 py-1 rounded transition-colors ${
              range === "7d"
                ? "bg-[#18181b] text-[#fafafa] font-medium border border-[#27272a]"
                : "text-[#71717a] hover:text-[#fafafa]"
            }`}
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => setRange("30d")}
            className={`px-3 py-1 rounded transition-colors ${
              range === "30d"
                ? "bg-[#18181b] text-[#fafafa] font-medium border border-[#27272a]"
                : "text-[#71717a] hover:text-[#fafafa]"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* SVG Visualization Chart */}
      <div className="w-full flex flex-col gap-2 pt-2">
        <div className="h-36 sm:h-44 w-full relative">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 700 160"
            role="img"
            aria-label="Gráfico de rendimiento de inferencia y volumen TC"
          >
            <defs>
              <linearGradient id="primaryGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal guides */}
            <line stroke="#18181b" strokeDasharray="3 3" x1="0" x2="700" y1="20" y2="20" />
            <line stroke="#18181b" strokeDasharray="3 3" x1="0" x2="700" y1="65" y2="65" />
            <line stroke="#18181b" strokeDasharray="3 3" x1="0" x2="700" y1="110" y2="110" />
            <line stroke="#27272a" x1="0" x2="700" y1="150" y2="150" />

            {/* Volume Area & Line (Purple) */}
            <path
              d="M0,130 C50,125 100,70 150,85 C200,100 250,35 300,40 C350,45 400,95 450,75 C500,55 550,25 600,35 C650,45 680,15 700,20 L700,155 L0,155 Z"
              fill="url(#primaryGradient)"
            />
            <path
              d="M0,130 C50,125 100,70 150,85 C200,100 250,35 300,40 C350,45 400,95 450,75 C500,55 550,25 600,35 C650,45 680,15 700,20"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2"
            />

            {/* Inference Speed Area & Line (Emerald) */}
            <path
              d="M0,145 C60,140 120,135 180,130 C240,125 300,118 360,122 C420,126 480,110 540,105 C600,100 660,95 700,90 L700,155 L0,155 Z"
              fill="url(#emeraldGradient)"
            />
            <path
              d="M0,145 C60,140 120,135 180,130 C240,125 300,118 360,122 C420,126 480,110 540,105 C600,100 660,95 700,90"
              fill="none"
              stroke="#34d399"
              strokeDasharray="4 2"
              strokeWidth="1.5"
            />

            {/* Active point beacon */}
            <circle cx="600" cy="35" fill="#a78bfa" r="4" stroke="#09090b" strokeWidth="2" />
            <circle cx="600" cy="35" fill="#a78bfa" fillOpacity="0.2" r="8" />
          </svg>
        </div>

        {/* Bottom Time Axis */}
        <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono text-[#71717a] pt-2">
          <span>00:00</span>
          <span>04:00</span>
          <span>
            08:00<span className="hidden sm:inline"> (Pico guardia)</span>
          </span>
          <span>12:00</span>
          <span>
            16:00<span className="hidden sm:inline"> (Pico ambulatorio)</span>
          </span>
          <span>20:00</span>
          <span className="text-[#fafafa] font-semibold">Ahora</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-[#18181b] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded bg-[#a78bfa]" />
            <span className="text-[#a1a1aa]">Estudios Recibidos/h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded bg-[#34d399]" />
            <span className="text-[#a1a1aa]">Velocidad Inferencia (s)</span>
          </div>
          <span className="sm:ml-auto text-[#71717a] text-[11px]">
            99.8% paquetes válidos DICOM
          </span>
        </div>
      </div>
    </div>
  );
}
