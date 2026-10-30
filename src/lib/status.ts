import type { ChangeVia, Reservation, Status, StatusChange } from "@/types/reservation";
import { HISTORY_MAX } from "@/lib/limits";
import { remainingSeats } from "@/lib/seats";

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

// id の申込の状態を to にし、updatedAt を変え、記録に1行足す。
// current は覚えておいたスナップショットなので書き換えず、新しい配列とオブジェクトを返す
function changeStatus(current: readonly Reservation[], id: string, to: Status, at: string, via: ChangeVia): Reservation[] {
  return current.map((r) =>
    r.id === id ? { ...r, status: to, updatedAt: at, history: appendHistory(r.history, { from: r.status, to, at, via }) } : r,
  );
}

// 読み直したデータ current で、id の申込が押した時に見えていた状態 shown のままなら、その申込を返す
function findShown(current: readonly Reservation[], id: string, shown: Status): Reservation | null {
  const target = current.find((r) => r.id === id);
  return target && target.status === shown ? target : null;
}

// F7：id の申込を、押した時に見えていた状態 shown の次にする。
// 申込がない・状態が shown と違う・次がない（別のタブで変わった）なら null（書かずに描き直すだけ）
export function advanceStatus(current: readonly Reservation[], id: string, shown: Status, at: string): Reservation[] | null {
  const to = nextStatus(shown);
  if (!findShown(current, id, shown) || to === null) return null;
  return changeStatus(current, id, to, at, "button");
}

// F11：キャンセルにする（新規・連絡済み・確定のときだけ）。決まりは F7 と同じ
export function cancelStatus(current: readonly Reservation[], id: string, shown: Status, at: string): Reservation[] | null {
  if (!findShown(current, id, shown) || !canCancel(shown)) return null;
  return changeStatus(current, id, "canceled", at, "button");
}

// F12：1つ前に戻す。押せない形に変わっていた・状態が shown と違うなら null（F7 と同じ）。
// キャンセルから戻すとき、読み直したデータの残り席が人数より少なければ "noSeats"（R-07。何も変えない）。
// 同じ連絡先・同じ日（F-17）は確かめない
export function undoStatus(current: readonly Reservation[], id: string, shown: Status, at: string): Reservation[] | null | "noSeats" {
  const target = findShown(current, id, shown);
  const to = target ? undoTarget(target.history) : null;
  if (!target || to === null) return null;
  if (shown === "canceled" && to !== "canceled" && remainingSeats(current, target.lessonDate) < target.people) return "noSeats";
  return changeStatus(current, id, to, at, "undo");
}
