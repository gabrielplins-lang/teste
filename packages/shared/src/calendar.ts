import { STORE } from "./store";

/** Datas são sempre strings "YYYY-MM-DD" para não sofrer com fuso horário. */
export type ISODate = string;
export type Month = string; // "YYYY-MM"
export type Weekdays = 5 | 6;

export const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
export const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(y: number, m: number, d: number): ISODate {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseISODate(date: ISODate): { y: number; m: number; d: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

/** 0 = domingo ... 6 = sábado */
export function weekdayOf(date: ISODate): number {
  const { y, m, d } = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: ISODate, days: number): ISODate {
  const { y, m, d } = parseISODate(date);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return toISODate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Data de hoje no horário de Brasília. */
export function todayInBrazil(now: Date = new Date()): ISODate {
  const br = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return toISODate(br.getUTCFullYear(), br.getUTCMonth() + 1, br.getUTCDate());
}

export function nextMonth(now: Date = new Date()): Month {
  const { y, m } = parseISODate(todayInBrazil(now));
  return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
}

export function monthLabel(month: Month): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} de ${y}`;
}

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
function easter(year: number): ISODate {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toISODate(year, month, day);
}

/** Feriados nacionais + estaduais do RJ + municipais do Rio. Dias sem entrega do Clube. */
export function holidays(year: number): Record<ISODate, string> {
  const fixed: [number, number, string][] = [
    [1, 1, "Ano Novo"],
    [1, 20, "São Sebastião"],
    [4, 21, "Tiradentes"],
    [4, 23, "São Jorge"],
    [5, 1, "Dia do Trabalho"],
    [9, 7, "Independência"],
    [10, 12, "N. Sra. Aparecida"],
    [11, 2, "Finados"],
    [11, 15, "Proclamação da República"],
    [11, 20, "Consciência Negra"],
    [12, 25, "Natal"],
  ];
  const out: Record<ISODate, string> = {};
  for (const [m, d, name] of fixed) out[toISODate(year, m, d)] = name;
  out[addDays(easter(year), -2)] = "Sexta-feira Santa";
  return out;
}

export interface MonthDay {
  date: ISODate;
  day: number;
  weekday: number;
  holiday?: string;
  delivery: boolean;
}

export function monthDays(month: Month, weekdays: Weekdays): MonthDay[] {
  const [y, m] = month.split("-").map(Number);
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const hol = holidays(y);
  const out: MonthDay[] = [];
  for (let day = 1; day <= total; day++) {
    const date = toISODate(y, m, day);
    const weekday = weekdayOf(date);
    const holiday = hol[date];
    const delivery = weekday !== 0 && (weekdays === 6 || weekday !== 6) && !holiday;
    out.push({ date, day, weekday, holiday, delivery });
  }
  return out;
}

export function deliveryDays(month: Month, weekdays: Weekdays): ISODate[] {
  return monthDays(month, weekdays).filter((d) => d.delivery).map((d) => d.date);
}

/** O assinante pode trocar o prato até as 20h do dia anterior (horário de Brasília). */
export function changeCutoff(date: ISODate): Date {
  return new Date(`${addDays(date, -1)}T20:00:00${STORE.timezoneOffset}`);
}

export function canChangeDay(date: ISODate, now: Date = new Date()): boolean {
  return now.getTime() < changeCutoff(date).getTime();
}

/** Início e fim de um dia no horário de Brasília, para filtrar pedidos. */
export function brazilDayRange(date: ISODate): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00${STORE.timezoneOffset}`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}
