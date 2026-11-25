import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  FilterX,
  RefreshCw,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { adminService } from "../services/admin.service";
import { extractApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/formatters";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuditEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTargetUserId = searchParams.get("target_user_id") || "";

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [eventTypeInput, setEventTypeInput] = useState("");
  const [actorUserIdInput, setActorUserIdInput] = useState("");
  const [targetUserIdInput, setTargetUserIdInput] = useState(initialTargetUserId);
  const [fromAtInput, setFromAtInput] = useState("");
  const [toAtInput, setToAtInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    event_type: "",
    actor_user_id: "",
    target_user_id: initialTargetUserId,
    from_at: "",
    to_at: "",
  });

  useEffect(() => {
    const paramTarget = searchParams.get("target_user_id") || "";
    setTargetUserIdInput(paramTarget);
    setAppliedFilters((prev) => ({ ...prev, target_user_id: paramTarget }));
  }, [searchParams]);

  const auditQuery = useQuery({
    queryKey: ["admin-audit-events", { page, size, ...appliedFilters }],
    queryFn: () =>
      adminService.listAuditEvents({
        page,
        size,
        event_type: appliedFilters.event_type || undefined,
        actor_user_id: appliedFilters.actor_user_id || undefined,
        target_user_id: appliedFilters.target_user_id || undefined,
        from_at: appliedFilters.from_at ? new Date(appliedFilters.from_at).toISOString() : undefined,
        to_at: appliedFilters.to_at ? new Date(appliedFilters.to_at).toISOString() : undefined,
      }),
  });

  const events = auditQuery.data?.data ?? [];
  const total = auditQuery.data?.total ?? 0;

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({
      event_type: eventTypeInput.trim(),
      actor_user_id: actorUserIdInput.trim(),
      target_user_id: targetUserIdInput.trim(),
      from_at: fromAtInput,
      to_at: toAtInput,
    });
  };

  const handleResetFilters = () => {
    setEventTypeInput("");
    setActorUserIdInput("");
    setTargetUserIdInput("");
    setFromAtInput("");
    setToAtInput("");
    setSearchParams({});
    setPage(1);
    setAppliedFilters({
      event_type: "",
      actor_user_id: "",
      target_user_id: "",
      from_at: "",
      to_at: "",
    });
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a1a1aa] font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span>SISTEMA</span>
          <span className="text-[#52525b]">/</span>
          <span>SEGURIDAD &amp; CUMPLIMIENTO</span>
          <span className="text-[#52525b]">/</span>
          <span className="text-[#a78bfa] font-medium">AUDITORÍA DE EVENTOS</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#34d399]">
          <ShieldCheck className="w-3.5 h-3.5" />
          REGISTRO INMUTABLE (APPEND-ONLY)
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">
              Auditoría y Trazabilidad de Seguridad
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#18181b] text-[#a78bfa] border border-[#27272a]">
              GET /api/v1/audit/events
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a1a1aa]">
            Consulta eventos de autenticación, cambios de estado, asignación de roles e intentos
            bloqueados registrados en PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={() => auditQuery.refetch()}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              auditQuery.isFetching ? "animate-spin text-[#a78bfa]" : "text-[#a1a1aa]"
            }`}
          />
          <span>Actualizar eventos</span>
        </button>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 shadow-sm"
      >
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            aria-label="Filtrar por tipo de evento"
            value={eventTypeInput}
            onChange={(e) => setEventTypeInput(e.target.value)}
            placeholder="Tipo de evento (ej. account.login, ROLE_ASSIGNED)..."
            className="w-full bg-[#121215] text-xs text-[#fafafa] placeholder:text-[#52525b] rounded-lg pl-9 pr-3 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
          />
        </div>

        <input
          type="text"
          aria-label="Filtrar por UUID de actor"
          value={actorUserIdInput}
          onChange={(e) => setActorUserIdInput(e.target.value)}
          placeholder="Actor UUID..."
          className="w-full bg-[#121215] text-xs font-mono text-[#fafafa] placeholder:text-[#52525b] rounded-lg px-3 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
        />

        <input
          type="text"
          aria-label="Filtrar por UUID de objetivo"
          value={targetUserIdInput}
          onChange={(e) => setTargetUserIdInput(e.target.value)}
          placeholder="Objetivo UUID..."
          className="w-full bg-[#121215] text-xs font-mono text-[#fafafa] placeholder:text-[#52525b] rounded-lg px-3 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
        />

        <input
          type="datetime-local"
          aria-label="Desde fecha"
          value={fromAtInput}
          onChange={(e) => setFromAtInput(e.target.value)}
          className="w-full bg-[#121215] text-xs font-mono text-[#fafafa] rounded-lg px-3 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
        />

        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            aria-label="Hasta fecha"
            value={toAtInput}
            onChange={(e) => setToAtInput(e.target.value)}
            className="w-full min-w-0 bg-[#121215] text-xs font-mono text-[#fafafa] rounded-lg px-2.5 py-2 border border-[#27272a] focus:outline-none focus:border-[#a78bfa]"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] text-xs font-semibold shrink-0 transition-colors"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            title="Restablecer filtros"
            aria-label="Restablecer filtros"
            className="p-2 rounded-lg bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] shrink-0 transition-colors"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </form>

      {auditQuery.isError && (
        <Alert variant="destructive" className="bg-[#3b1111]/70 border-[#ef4444]/40 text-[#fca5a5]">
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
          <AlertDescription className="text-xs">
            {
              extractApiError(
                auditQuery.error,
                "No se pudieron consultar los eventos de auditoría."
              ).message
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Events Container */}
      <div className="w-full overflow-hidden rounded-xl border border-[#27272a] bg-[#0c0c0f] shadow-sm flex flex-col">
        {auditQuery.isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#a1a1aa]">
            <Loader2 className="w-6 h-6 animate-spin text-[#a78bfa]" />
            <span>Consultando stream de auditoría...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
            <History className="w-8 h-8 text-[#52525b]" />
            <p className="text-sm font-medium text-[#fafafa]">
              No se encontraron eventos de auditoría
            </p>
            <p className="text-xs text-[#71717a]">
              Ajusta los filtros de tipo, usuario o rango de fechas.
            </p>
          </div>
        ) : (
          <div className="md:overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-[#121215]/80 text-[11px] uppercase tracking-wider text-[#a1a1aa] font-medium border-b border-[#27272a]">
                  <th className="px-4 py-3 font-medium">Fecha &amp; Hora</th>
                  <th className="px-4 py-3 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Resultado</th>
                  <th className="px-4 py-3 font-medium">Actor / Objetivo</th>
                  <th className="px-4 py-3 font-medium">Origen (IP / Metadata)</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-[#18181b]">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="block md:table-row p-4 md:p-0 space-y-2.5 md:space-y-0 hover:bg-[#121215]/70 transition-colors"
                  >
                    <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3 font-mono text-[11px] text-[#a1a1aa] whitespace-nowrap">
                      <span className="md:hidden text-[10px] uppercase text-[#71717a]">Fecha</span>
                      <span>{formatDateTime(ev.occurred_at, "-")}</span>
                    </td>

                    <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3">
                      <span className="md:hidden text-[10px] font-mono uppercase text-[#71717a]">
                        Evento
                      </span>
                      <span className="font-mono font-semibold text-[#fafafa]">
                        {ev.event_type}
                      </span>
                    </td>

                    <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3">
                      <span className="md:hidden text-[10px] font-mono uppercase text-[#71717a]">
                        Resultado
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          ev.outcome === "success"
                            ? "bg-[#065f46]/30 text-[#34d399] border-[#065f46]/50"
                            : ev.outcome === "blocked"
                            ? "bg-amber-950/50 text-amber-300 border-amber-800/50"
                            : "bg-[#3b1111]/50 text-[#fca5a5] border-[#ef4444]/40"
                        }`}
                      >
                        {ev.outcome}
                      </span>
                    </td>

                    <td className="flex items-center justify-between gap-2 md:table-cell md:px-4 md:py-3 font-mono text-[11px]">
                      <span className="md:hidden text-[10px] uppercase text-[#71717a] shrink-0">
                        Usuarios
                      </span>
                      <div className="flex flex-col text-right md:text-left">
                        <span className="text-[#a1a1aa]">
                          Actor:{" "}
                          <span className="text-[#fafafa]">
                            {ev.actor_user_id ? `${ev.actor_user_id.slice(0, 8)}...` : "Sistema"}
                          </span>
                        </span>
                        <span className="text-[#71717a]">
                          Obj:{" "}
                          <span className="text-[#a1a1aa]">
                            {ev.target_user_id ? `${ev.target_user_id.slice(0, 8)}...` : "-"}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className="flex flex-col gap-1 md:table-cell md:px-4 md:py-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between md:justify-start gap-2">
                        <span className="md:hidden text-[10px] uppercase text-[#71717a]">
                          IP / Metadata
                        </span>
                        <span className="text-[#a1a1aa]">{ev.ip_address || "IP N/A"}</span>
                      </div>
                      {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                        <span className="text-[10px] text-[#71717a] break-all">
                          {JSON.stringify(ev.metadata)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationBar
          page={page}
          size={size}
          total={total}
          itemLabel="eventos"
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setSize(newSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
