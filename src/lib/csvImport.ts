import type { Reservation } from "@/types/reservation";
import { CSV_MAX_ROWS, MEMO_MAX, NAME_MAX, PEOPLE_OPTIONS, REQUEST_MAX, RESERVATIONS_MAX } from "@/lib/limits";
import { isLessonDate } from "@/lib/lessons";
import { STATUSES, STATUS_LABELS } from "@/lib/status";
import { parseCsvDateTime, parseCsvLessonDate } from "@/lib/dateFormat";
import { isValidEmail, isValidId, isValidPhone, normalizePhone, validateReservation } from "@/lib/reservationValidate";
import { decodeCsv, parseCsv } from "@/lib/csvParse";

// CSV の読み込みの後半（要件定義書8章・F16。T07）：見出しを合わせ、1行ずつ確かめて申込にする

const REQUIRED_HEADERS = ["お名前", "メール", "電話", "希望日", "人数"];
// 書き出し（csvFormat.ts）で付けた ' ：直後が = + - @ タブ CR のときだけ外す
const QUOTED_FORMULA = /^'[=+\-@\t\r]/;

export function stripFormulaQuote(value: string): string {
  return QUOTED_FORMULA.test(value) ? value.slice(1) : value;
}

export type RowError = { line: number; reason: string };
// unreadable＝V-15／badHeader＝V-11／preview＝V-04・V-05 を見せる結果
export type ImportResult = { kind: "unreadable" } | { kind: "badHeader" } | { kind: "preview"; rows: Reservation[]; errors: RowError[] };

type Cell = (header: string) => string;

// 1行を申込にする。読めなければ理由（V-20〜）を返す。now は読み込んだ時刻（空の日時と記録に使う）
function toReservation(cell: Cell, now: string, newId: () => string, seen: Set<string>): Reservation | string {
  const name = cell("お名前").trim();
  if (name === "") return "お名前が空です";
  if (name.length > NAME_MAX) return `お名前が${NAME_MAX}字を超えています`;
  if (/[\r\n]/.test(name)) return "お名前に改行が入っています";
  const email = cell("メール").trim();
  const phone = normalizePhone(cell("電話"));
  if (email === "" && phone === "") return "メールと電話の両方が空です";
  if (email !== "" && !isValidEmail(email)) return "メールの形が違います";
  if (phone !== "" && !isValidPhone(phone)) return "電話の形が違います";
  const lessonDate = parseCsvLessonDate(cell("希望日").trim());
  if (lessonDate === null || !isLessonDate(lessonDate)) return "開催日にない日付です";
  const people = PEOPLE_OPTIONS.find((p) => String(p) === cell("人数").trim());
  if (!people) return "人数が1〜4ではありません";
  const request = cell("ご要望");
  if (request.length > REQUEST_MAX) return `ご要望が${REQUEST_MAX}字を超えています`;
  const statusText = cell("状態").trim();
  const status = statusText === "" ? "new" : STATUSES.find((s) => STATUS_LABELS[s] === statusText);
  if (!status) return "状態の名前が違います";
  const memo = cell("メモ");
  if (memo.length > MEMO_MAX) return `メモが${MEMO_MAX}字を超えています`;
  const readTime = (header: string) => (cell(header).trim() === "" ? now : parseCsvDateTime(cell(header).trim()));
  const createdAt = readTime("申込日時");
  const updatedAt = readTime("更新日時");
  if (createdAt === null || updatedAt === null) return "日時の形が違います";
  const idText = cell("id").trim();
  if (idText !== "" && !isValidId(idText)) return "id の形が違います（英数字とハイフンで64字まで）";
  if (idText !== "" && seen.has(idText)) return "同じ id が2回出てきます";
  if (idText !== "") seen.add(idText);

  // 記録は CSV に入れないので、1行「CSV から読み込み」で始める
  const history = [{ from: null, to: status, at: now, via: "csv" }];
  const id = idText === "" ? newId() : idText;
  // 念のため localStorage と同じ検証も通す（確かめた項目だけで新しいオブジェクトになる）
  return validateReservation({ id, name, email, phone, lessonDate, people, request, status, memo, createdAt, updatedAt, history }) ?? "日時の形が違います";
}

export function readCsv(buffer: ArrayBuffer, now: string, newId: () => string): ImportResult {
  const text = decodeCsv(buffer);
  if (text === null) return { kind: "unreadable" };
  // 見出しの1行＋1000行まで
  const parsed = parseCsv(text, CSV_MAX_ROWS + 1);
  if (!parsed.ok) return { kind: "unreadable" };
  const [header = [], ...body] = parsed.records;
  const index = new Map<string, number>();
  header.forEach((h, i) => {
    const key = h.replace(/^﻿/, "").trim();
    if (!index.has(key)) index.set(key, i);
  });
  if (REQUIRED_HEADERS.some((h) => !index.has(h))) return { kind: "badHeader" };

  const rows: Reservation[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();
  body.forEach((record, k) => {
    // すべてのセルが空の行は飛ばす（行番号は数える）
    if (record.every((v) => v.trim() === "")) return;
    const cell: Cell = (h) => {
      const i = index.get(h);
      return i === undefined ? "" : stripFormulaQuote(record[i] ?? "");
    };
    const result = toReservation(cell, now, newId, seen);
    // 行番号は見出しを1行目としたレコードの番号（Excel の行番号と同じ）
    if (typeof result === "string") errors.push({ line: k + 2, reason: result });
    else rows.push(result);
  });
  return { kind: "preview", rows, errors };
}

// 足す：同じ id は飛ばす。読み直した今の件数＋足す件数が300を超えたら null（V-14）
export function planAdd(current: readonly Reservation[], rows: readonly Reservation[]): { next: Reservation[]; added: number; skipped: number } | null {
  const ids = new Set(current.map((r) => r.id));
  const toAdd = rows.filter((r) => !ids.has(r.id));
  if (current.length + toAdd.length > RESERVATIONS_MAX) return null;
  return { next: [...current, ...toAdd], added: toAdd.length, skipped: rows.length - toAdd.length };
}
