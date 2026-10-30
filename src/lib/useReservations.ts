import { useSyncExternalStore } from "react";
import {
  getReservationSnapshot,
  getServerReservationSnapshot,
  subscribeReservations,
  type ReservationSnapshot,
  type StorageNotice,
} from "@/lib/reservationStorage";

// S-01〜S-04 の文言（要件定義書11章）
export const STORAGE_NOTICE_TEXT: Record<StorageNotice, string> = {
  saveFailed: "保存できませんでした。ブラウザの空き容量を確認してください。表示中の内容は、このページを閉じると失われます。",
  unavailable: "このブラウザでは保存できません（サイトのデータを保存しない設定など）。表示中の内容は、このページを閉じると失われます。",
  partial: "保存データの一部を読み込めなかったため、読み込めた分だけ表示しています。次に操作すると、読み込めた分だけで保存し直します。",
  broken: "保存データを読み込めなかったため、最初の架空の10件を表示しています。次に操作すると、この10件で保存し直します。",
};

// 書き出しの時と Hydration の時は「読み込み中」、その後に localStorage（またはメモリ）の値になる
export function useReservations(): ReservationSnapshot {
  return useSyncExternalStore(subscribeReservations, getReservationSnapshot, getServerReservationSnapshot);
}
