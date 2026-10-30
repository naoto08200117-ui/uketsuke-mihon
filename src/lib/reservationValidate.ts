import type { Reservation, StatusChange } from "@/types/reservation";
import { EMAIL_MAX, HISTORY_MAX, ID_MAX, MEMO_MAX, NAME_MAX, PEOPLE_OPTIONS, PHONE_DIGITS_MAX, PHONE_DIGITS_MIN, PHONE_MAX, REQUEST_MAX, RESERVATIONS_MAX } from "@/lib/limits";
import { isLessonDate } from "@/lib/lessons";
import { STATUSES, VIAS } from "@/lib/status";
import { isIsoTimestamp } from "@/lib/dateFormat";

// 読み込んだ値は改ざんされている前提で1件ずつ確かめる（localStorage と CSV の両方で使う。要件定義書5章）。
// 確かめた項目だけで新しいオブジェクトを組み立て、元のオブジェクトは広げない（知らない鍵は捨てる）。

const ID_PATTERN = new RegExp(`^[A-Za-z0-9-]{1,${ID_MAX}}$`);
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// 全角の数字と、ハイフンに似た文字（U+FF0D・U+2010〜U+2015・U+2212・U+30FC・U+FF70）
const HYPHEN_LIKE = /[－‐-―−ーｰ]/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

export function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(HYPHEN_LIKE, "-");
}

export function isValidEmail(email: string): boolean {
  return email.length <= EMAIL_MAX && EMAIL_PATTERN.test(email);
}

// 直した後の値で確かめる：数字とハイフンだけ・数字が10〜11桁・13字まで
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/-/g, "").length;
  return /^[0-9-]+$/.test(phone) && phone.length <= PHONE_MAX && digits >= PHONE_DIGITS_MIN && digits <= PHONE_DIGITS_MAX;
}

function readHistory(value: unknown): StatusChange[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > HISTORY_MAX) return null;
  const rows: StatusChange[] = [];
  for (const [index, row] of value.entries()) {
    if (!isRecord(row)) return null;
    const to = STATUSES.find((s) => s === row.to);
    const via = VIAS.find((v) => v === row.via);
    // from: null は1行目だけ。1行目が null でなくてもよい（50行に切り詰めた後）
    const from = row.from === null && index === 0 ? null : STATUSES.find((s) => s === row.from);
    if (!to || !via || from === undefined || typeof row.at !== "string" || !isIsoTimestamp(row.at)) return null;
    rows.push({ from, to, at: row.at, via });
  }
  return rows;
}

export function validateReservation(raw: unknown): Reservation | null {
  if (!isRecord(raw) || !isValidId(raw.id)) return null;
  const { name, email, phone, lessonDate, request, memo, createdAt, updatedAt } = raw;
  if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string") return null;
  if (typeof lessonDate !== "string" || typeof request !== "string" || typeof memo !== "string") return null;
  if (typeof createdAt !== "string" || typeof updatedAt !== "string") return null;

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const fixedPhone = normalizePhone(phone);
  if (trimmedName.length < 1 || trimmedName.length > NAME_MAX || /[\r\n]/.test(trimmedName)) return null;
  if (trimmedEmail === "" && fixedPhone === "") return null;
  if (trimmedEmail !== "" && !isValidEmail(trimmedEmail)) return null;
  if (fixedPhone !== "" && !isValidPhone(fixedPhone)) return null;
  if (!isLessonDate(lessonDate) || request.length > REQUEST_MAX || memo.length > MEMO_MAX) return null;
  if (!isIsoTimestamp(createdAt) || !isIsoTimestamp(updatedAt)) return null;

  const people = PEOPLE_OPTIONS.find((p) => p === raw.people);
  const status = STATUSES.find((s) => s === raw.status);
  const history = readHistory(raw.history);
  if (!people || !status || !history || history[history.length - 1].to !== status) return null;

  return { id: raw.id, name: trimmedName, email: trimmedEmail, phone: fixedPhone, lessonDate, people, request, status, memo, createdAt, updatedAt, history };
}

export type StoreResult = { ok: false } | { ok: true; reservations: Reservation[]; dropped: boolean };

// 全体が読めないとき（オブジェクトでない・version が1でない・reservations が配列でない）は ok: false。
// 通らない件・同じ id の2件目から・301件目からは捨てて dropped: true
export function validateStore(raw: unknown): StoreResult {
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.reservations)) return { ok: false };
  const reservations: Reservation[] = [];
  const seen = new Set<string>();
  let dropped = false;
  for (const item of raw.reservations) {
    const r = validateReservation(item);
    if (!r || seen.has(r.id) || reservations.length >= RESERVATIONS_MAX) {
      dropped = true;
      continue;
    }
    seen.add(r.id);
    reservations.push(r);
  }
  return { ok: true, reservations, dropped };
}
