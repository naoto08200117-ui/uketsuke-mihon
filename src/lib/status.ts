import type { ChangeVia, Status, StatusChange } from "@/types/reservation";
import { HISTORY_MAX } from "@/lib/limits";

// 状態の進め方（要件定義書5章・F7・F12）
export const STATUSES: readonly Status[] = ["new", "contacted", "confirmed", "done", "canceled"];
export const VIAS: readonly ChangeVia[] = ["form", "button", "undo", "csv", "seed"];

export const STATUS_LABELS: Record<Status, string> = {
  new: "新規",
  contacted: "連絡済み",
  confirmed: "確定",
  done: "完了",
  canceled: "キャンセル",
};

export const VIA_LABELS: Record<ChangeVia, string> = {
  form: "申込フォーム",
  button: "ボタン",
  undo: "1つ前に戻す",
  csv: "CSV の読み込み",
  seed: "架空のデータ",
};

const NEXT: Partial<Record<Status, Status>> = {
  new: "contacted",
  contacted: "confirmed",
  confirmed: "done",
};

// 完了とキャンセルには次がない
export function nextStatus(status: Status): Status | null {
  return NEXT[status] ?? null;
}

export function canCancel(status: Status): boolean {
  return status === "new" || status === "contacted" || status === "confirmed";
}

// 1回だけ戻せる。最後の行の from が null、または via が "undo" なら押せない
export function undoTarget(history: readonly StatusChange[]): Status | null {
  const last = history[history.length - 1];
  if (!last || last.from === null || last.via === "undo") return null;
  return last.from;
}

// 足して51行になったら一番古い行を捨てる
export function appendHistory(history: readonly StatusChange[], change: StatusChange): StatusChange[] {
  return [...history, change].slice(-HISTORY_MAX);
}
