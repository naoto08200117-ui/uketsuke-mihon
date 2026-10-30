import type { Reservation, ReservationStore } from "@/types/reservation";
import { SEED_RESERVATIONS } from "@/lib/seed";
import { validateStore } from "@/lib/reservationValidate";

// localStorage を触ってよいのはこのファイルの関数だけ（要件定義書10章）。
// 設計の理由は docs/decisions/0004_保存と読み直しの設計.md

const STORAGE_KEY = "uketsuke-mihon.v1";

// saveFailed＝S-01／unavailable＝S-02／partial＝S-03／broken＝S-04
export type StorageNotice = "saveFailed" | "unavailable" | "partial" | "broken";
export type LoadedSnapshot = { loading: false; reservations: readonly Reservation[]; notice: StorageNotice | null };
export type ReservationSnapshot = { loading: true } | LoadedSnapshot;

// 書き出しの時と Hydration の時に使う「読み込み中」。毎回同じオブジェクトを返す
const LOADING_SNAPSHOT: ReservationSnapshot = { loading: true };

const listeners = new Set<() => void>();
// S-01 の後・S-02 のときの「今のデータ」。あれば localStorage より優先する
let memory: LoadedSnapshot | null = null;
// 同じ文字列なら同じオブジェクトを返すための覚え（毎回新しいオブジェクトだと無限に描き直す）
let cachedKey: string | null = null;
let cachedSnapshot: LoadedSnapshot | null = null;

type ReadResult = { key: string; raw: string | null } | { key: string; unavailable: true };

function readRaw(): ReadResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // 先頭の1字で「空」と「値あり」を分け、値と取り違えないようにする
    return { key: raw === null ? "e" : `v${raw}`, raw };
  } catch {
    return { key: "u", unavailable: true };
  }
}

function toSnapshot(read: ReadResult): LoadedSnapshot {
  if ("unavailable" in read) return { loading: false, reservations: SEED_RESERVATIONS, notice: "unavailable" };
  if (read.raw === null) return { loading: false, reservations: SEED_RESERVATIONS, notice: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(read.raw);
  } catch {
    return { loading: false, reservations: SEED_RESERVATIONS, notice: "broken" };
  }
  const result = validateStore(parsed);
  if (!result.ok) return { loading: false, reservations: SEED_RESERVATIONS, notice: "broken" };
  return { loading: false, reservations: result.reservations, notice: result.dropped ? "partial" : null };
}

// 読むだけ。ここでは決して書かない（壊れた値も、利用者が操作するまでそのまま残す）
function readCurrent(): LoadedSnapshot {
  if (memory) return memory;
  const read = readRaw();
  if (cachedSnapshot && cachedKey === read.key) return cachedSnapshot;
  cachedKey = read.key;
  cachedSnapshot = toSnapshot(read);
  return cachedSnapshot;
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function getReservationSnapshot(): ReservationSnapshot {
  return readCurrent();
}

export function getServerReservationSnapshot(): ReservationSnapshot {
  return LOADING_SNAPSHOT;
}

// 別のタブの変更（storage イベント）と、同じタブの保存・メモリの値の変更（listeners）の両方を購読する
export function subscribeReservations(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export type WriteResult = "saved" | "memory" | "unchanged";

// 変更は「今のデータ → 新しいデータ」の関数で渡す。保存の直前に読み直して検証した値に当てる。
// 変える必要がなければ（申込がない・状態が違うなど）null を返してもらい、書かずに描き直すだけにする
export function updateReservations(change: (current: readonly Reservation[]) => Reservation[] | null): WriteResult {
  const current = readCurrent();
  const next = change(current.reservations);
  if (next === null) {
    notify();
    return "unchanged";
  }
  const store: ReservationStore = { version: 1, reservations: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    memory = null;
    notify();
    return "saved";
  } catch {
    // 保存の場所が使えないなら S-02 のまま、使えるのに書けないなら S-01
    const notice = current.notice === "unavailable" ? "unavailable" : "saveFailed";
    memory = { loading: false, reservations: next, notice };
    notify();
    return "memory";
  }
}
