import type { UserAccountStatus } from "../types";

const STATUS_STYLES: Record<
  UserAccountStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: "Activo",
    badgeClass: "bg-[#065f46]/30 text-[#34d399] border-[#065f46]/50",
    dotClass: "bg-[#34d399]",
  },
  pending: {
    label: "Pendiente",
    badgeClass: "bg-amber-950/50 text-amber-300 border-amber-800/50",
    dotClass: "bg-amber-400",
  },
  suspended: {
    label: "Suspendido",
    badgeClass: "bg-[#3b1111]/50 text-[#fca5a5] border-[#ef4444]/40",
    dotClass: "bg-[#ef4444]",
  },
  disabled: {
    label: "Deshabilitado",
    badgeClass: "bg-[#18181b] text-[#a1a1aa] border-[#27272a]",
    dotClass: "bg-[#71717a]",
  },
};

export function UserStatusBadge({ status }: { status: UserAccountStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.disabled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${style.badgeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${style.dotClass} ${
          status === "active" ? "animate-pulse" : ""
        }`}
      />
      {style.label}
    </span>
  );
}
