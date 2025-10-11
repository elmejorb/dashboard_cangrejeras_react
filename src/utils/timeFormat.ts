/**
 * Utilidades para formatear tiempo en formato 24 horas (Puerto Rico)
 */

/**
 * Formatea una hora en formato HH:mm a formato legible 24h
 * @param time - Hora en formato HH:mm (ej: "19:00")
 * @returns Hora formateada con sufijo "h" (ej: "19:00h")
 */
export function format24Hour(time: string): string {
  if (!time) return '';
  return `${time}h`;
}

/**
 * Formatea una fecha y hora completa
 * @param date - Fecha en formato YYYY-MM-DD
 * @param time - Hora en formato HH:mm
 * @returns Fecha y hora formateadas (ej: "2025-10-15 a las 19:00h")
 */
export function formatDateTime(date: string, time: string): string {
  if (!date || !time) return '';
  return `${date} a las ${time}h`;
}

/**
 * Formatea una fecha en formato local de Puerto Rico
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada (ej: "15 de octubre de 2025")
 */
export function formatDatePR(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString + 'T00:00:00');
  
  return date.toLocaleDateString('es-PR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha y hora completa en formato local
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param timeString - Hora en formato HH:mm
 * @returns Fecha y hora formateadas (ej: "15 de octubre de 2025, 19:00h")
 */
export function formatDateTimePR(dateString: string, timeString: string): string {
  if (!dateString || !timeString) return '';
  
  const datePart = formatDatePR(dateString);
  return `${datePart}, ${timeString}h`;
}

/**
 * Obtiene la hora actual en formato HH:mm (24h)
 * @returns Hora actual (ej: "19:30")
 */
export function getCurrentTime24h(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns Fecha actual
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida si una hora está en formato 24h válido
 * @param time - Hora a validar
 * @returns true si es válida
 */
export function isValid24HourTime(time: string): boolean {
  if (!time) return false;
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Compara dos horas en formato 24h
 * @param time1 - Primera hora (HH:mm)
 * @param time2 - Segunda hora (HH:mm)
 * @returns -1 si time1 < time2, 0 si iguales, 1 si time1 > time2
 */
export function compareTime24h(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  if (minutes1 < minutes2) return -1;
  if (minutes1 > minutes2) return 1;
  return 0;
}
