// 日付・日時の文字はここだけで組み立てる（要件定義書8章・10章）。
// 見る人の PC の時間帯に左右されないよう、Intl・toLocale*・new Date(文字列)・Date.parse は使わず、
// 正規表現で数字を取り出して Date.UTC と getUTC* だけで計算する。

const WEEKDAYS = "日月火水木金土";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;

type YMD = { year: number; month: number; day: number };

// "YYYY-MM-DD" を数字にする。その月にない日は null
export function parseDate(value: string): YMD | null {
  const m = DATE_PATTERN.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function weekdayOf(year: number, month: number, day: number): string {
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

// "2026-12-05" → "12月5日（土）"（0を付けない）。形が違えば元の文字を返す
export function formatLessonDate(value: string): string {
  const ymd = parseDate(value);
  if (!ymd) return value;
  return `${ymd.month}月${ymd.day}日（${weekdayOf(ymd.year, ymd.month, ymd.day)}）`;
}

// toISOString() の形（例 "2026-10-26T13:10:00.000Z"）で、実在する日時か
export function isIsoTimestamp(value: string): boolean {
  const m = ISO_PATTERN.exec(value);
  if (!m) return false;
  const ms = Date.UTC(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
    Number(m[7]),
  );
  // 読み戻して同じ文字になれば、月・日・時・分・秒が範囲内
  return new Date(ms).toISOString() === value;
}

// 日本時間は UTC に9時間足した時刻（日本は夏時間がない）
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// toISOString() の形 → 日本時間の "YYYY/MM/DD HH:mm"（F14・R-06・詳細の申込日時）。形が違えば元の文字を返す
export function formatDateTime(value: string): string {
  const m = ISO_PATTERN.exec(value);
  if (!m || !isIsoTimestamp(value)) return value;
  const jst = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])) + JST_OFFSET_MS);
  const date = `${jst.getUTCFullYear()}/${pad2(jst.getUTCMonth() + 1)}/${pad2(jst.getUTCDate())}`;
  return `${date} ${pad2(jst.getUTCHours())}:${pad2(jst.getUTCMinutes())}`;
}

// toISOString() の形 → CSV に書き出す日本時間の "YYYY-MM-DD HH:mm"（要件定義書8章）。形が違えば元の文字を返す
export function formatCsvDateTime(value: string): string {
  const shown = formatDateTime(value);
  if (shown === value) return value;
  return shown.replaceAll("/", "-");
}

// 時刻（ミリ秒）→ 日本時間の今日 "YYYYMMDD"（CSV のファイル名）
export function formatFileDate(ms: number): string {
  const jst = new Date(ms + JST_OFFSET_MS);
  return `${jst.getUTCFullYear()}${pad2(jst.getUTCMonth() + 1)}${pad2(jst.getUTCDate())}`;
}

// ── CSV の読み込み（要件定義書8章「日付と日時」。T07）──

const CSV_DATE_PATTERNS = [/^(\d{4})-(\d{2})-(\d{2})$/, /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/];
// YYYY/M/D H:mm／YYYY-MM-DD HH:mm（どちらも :ss があってよい）／ISO 8601（秒・ミリ秒・時差は無くてもよい）
const CSV_DATETIME_PATTERNS = [
  /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{2})(?::(\d{2}))?()()$/,
  /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?()()$/,
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/,
];

// 希望日 "YYYY-MM-DD"・"YYYY/M/D" → "YYYY-MM-DD"。その月にない日は null
export function parseCsvLessonDate(value: string): string | null {
  const m = CSV_DATE_PATTERNS.map((p) => p.exec(value)).find((r) => r !== null);
  if (!m) return null;
  const text = `${m[1]}-${pad2(Number(m[2]))}-${pad2(Number(m[3]))}`;
  return parseDate(text) ? text : null;
}

// 時差 "Z"・"+09:00" を分にする。書いていなければ日本時間（+09:00）
function offsetMinutes(zone: string | undefined): number | null {
  if (!zone) return 9 * 60;
  if (zone === "Z") return 0;
  const hours = Number(zone.slice(1, 3));
  const minutes = Number(zone.slice(4, 6));
  if (hours > 23 || minutes > 59) return null;
  return (zone[0] === "-" ? -1 : 1) * (hours * 60 + minutes);
}

// 申込日時・更新日時 → toISOString() の形。形が違う・ない日時なら null
export function parseCsvDateTime(value: string): string | null {
  const m = CSV_DATETIME_PATTERNS.map((p) => p.exec(value)).find((r) => r !== null);
  if (!m) return null;
  const [year, month, day, hour, minute] = [1, 2, 3, 4, 5].map((i) => Number(m[i]));
  const second = m[6] ? Number(m[6]) : 0;
  const milli = m[7] ? Number(m[7].padEnd(3, "0")) : 0;
  const offset = offsetMinutes(m[8] || undefined);
  if (offset === null || hour > 23 || minute > 59 || second > 59) return null;
  if (!parseDate(`${year}-${pad2(month)}-${pad2(day)}`)) return null;
  const ms = Date.UTC(year, month - 1, day, hour, minute, second, milli) - offset * 60 * 1000;
  return new Date(ms).toISOString();
}
