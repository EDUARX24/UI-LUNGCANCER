/**
 * Formats an ISO timestamp into a concise Spanish locale date-time string.
 */
export function formatDateTime(iso: string | null | undefined, emptyLabel = "Nunca"): string {
  if (!iso) return emptyLabel;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Computes two-letter uppercase initials from first and last name.
 */
export function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "US";
}
