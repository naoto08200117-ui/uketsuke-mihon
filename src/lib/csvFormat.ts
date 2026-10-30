import type { Reservation } from "@/types/reservation";
import { STATUS_LABELS } from "@/lib/status";
import { formatCsvDateTime, formatFileDate } from "@/lib/dateFormat";

// CSV の書き出しの形（要件定義書8章・F15。T06）。読み込み（csvParse.ts・csvImport.ts）は T07

// 書き出す列の順（見出し）
export const CSV_HEADERS = [
  "id",
  "お名前",
  "メール",
  "電話",
  "希望日",
  "人数",
  "ご要望",
  "状態",
  "メモ",
  "申込日時",
  "更新日時",
] as const;

// Excel が先頭の1字を数式として読む文字（= + - @ タブ CR）
const FORMULA_START = /^[=+\-@\t\r]/;

// 数式の注入の対策：危ない文字で始まる値の前に ' を付ける（読み込みで外すのは csvImport.ts）
export function escapeFormula(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

// すべてのセルを " で囲み、中の " は "" にする（RFC 4180。中のコンマ・改行もそのまま入る）
function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function toRow(r: Reservation): string[] {
  return [
    r.id,
    r.name,
    r.email,
    r.phone,
    r.lessonDate,
    String(r.people),
    r.request,
    STATUS_LABELS[r.status],
    r.memo,
    formatCsvDateTime(r.createdAt),
    formatCsvDateTime(r.updatedAt),
  ];
}

// 全件を CSV の文字にする。先頭に BOM（Excel で文字化けしないように）、行の区切りは CRLF。
// Blob にすると UTF-8 で書かれる
export function buildCsv(reservations: readonly Reservation[]): string {
  const lines = [
    CSV_HEADERS.map(quote).join(","),
    ...reservations.map((r) => toRow(r).map((v) => quote(escapeFormula(v))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}

// uketsuke_mihon_YYYYMMDD.csv（日本時間の今日）
export function csvFileName(nowMs: number): string {
  return `uketsuke_mihon_${formatFileDate(nowMs)}.csv`;
}
