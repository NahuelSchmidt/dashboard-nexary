export const TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Formatea una fecha guardada como texto "YYYY-MM-DD" a "DD/MM/YYYY", sin pasar por Date (evita corrimientos de zona horaria). */
export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

/** Parsea "YYYY-MM-DD" a un Date en horario local (mediodia, para evitar problemas de corrimiento de dia). */
export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Fecha de hoy como "YYYY-MM-DD" en horario de Argentina (no UTC). */
export function todayStr(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}
