import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  page: number;
  size: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
}

/**
 * Reusable Stitch-styled pagination bar with responsive layout.
 */
export function PaginationBar({
  page,
  size,
  total,
  itemLabel = "registros",
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 50],
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(total, page * size);

  const visiblePages: number[] = [];
  const startPage = Math.max(1, page - 1);
  const endPage = Math.min(totalPages, page + 1);
  for (let p = startPage; p <= endPage; p++) {
    visiblePages.push(p);
  }

  return (
    <div className="bg-[#18181b]/70 border-t border-[#27272a] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#a1a1aa]">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        <span>
          Mostrando{" "}
          <span className="font-semibold text-[#fafafa]">
            {start}-{end}
          </span>{" "}
          de <span className="font-semibold text-[#fafafa]">{total}</span> {itemLabel}
        </span>

        {onSizeChange && (
          <div className="flex items-center gap-2 sm:pl-3 sm:border-l sm:border-[#27272a]">
            <label htmlFor="pagination-size" className="text-[#71717a]">
              Filas:
            </label>
            <select
              id="pagination-size"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="bg-[#121215] hover:bg-[#18181b] text-[#fafafa] border border-[#27272a] rounded px-2 py-0.5 focus:outline-none focus:border-[#a78bfa] cursor-pointer"
            >
              {sizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / pág
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#fafafa] text-xs flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="w-7 h-7 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs flex items-center justify-center transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1 text-[#52525b]">...</span>}
            </>
          )}

          {visiblePages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-colors ${
                p === page
                  ? "bg-[#a78bfa] text-[#0a0012] font-semibold"
                  : "bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa]"
              }`}
            >
              {p}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-[#52525b]">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="w-7 h-7 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs flex items-center justify-center transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1 rounded-md bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-[#fafafa] text-xs flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
