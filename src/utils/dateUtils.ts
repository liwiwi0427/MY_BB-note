export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTime(isoString: string): string {
  return formatTimeOnly(isoString);
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
}

export function calculateAge(birthDateStr: string, targetDateStr?: string): AgeResult {
  const birthDate = new Date(birthDateStr);
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

  const diffTime = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);

  let formatted = '';
  if (years > 0) {
    formatted = `${years}歲 ${months}個月 ${days}天`;
  } else if (months > 0) {
    formatted = `${months}個月 ${days}天`;
  } else {
    formatted = `${days}天`;
  }

  return {
    years,
    months: totalMonths,
    days,
    totalDays,
    formatted,
  };
}
