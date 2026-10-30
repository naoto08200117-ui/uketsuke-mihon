"use client";

import type { MouseEvent } from "react";
import type { Reservation } from "@/types/reservation";
import { STATUS_LABELS, advanceStatus, nextStatus } from "@/lib/status";
import { updateReservations } from "@/lib/reservationStorage";
import { secondaryButtonClass } from "@/components/form/Field";

// F7：状態をボタン1回で進める（2つ目のボタン）。完了・キャンセルは「—」
export default function NextStatusButton({
  reservation,
  onChanged,
}: {
  reservation: Reservation;
  onChanged: (message: string) => void;
}) {
  // 押した時に見えていた状態（ボタンの元の状態）
  const shown = reservation.status;
  const next = nextStatus(shown);
  if (next === null) return <span className="text-body text-ink">—</span>;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // ダブルクリックの2回目などは何もしない。Enter・Space は detail が 0 なので効く
    if (event.detail >= 2) return;
    const at = new Date().toISOString();
    const result = updateReservations((current) => advanceStatus(current, reservation.id, shown, at));
    // 読み直したら変えるものがなかったときは、文言を足さずに描き直すだけ
    if (result !== "unchanged" && next !== null) onChanged(`「${reservation.name}」を${STATUS_LABELS[next]}にしました。`);
  }

  return (
    <button type="button" onClick={handleClick} className={`${secondaryButtonClass} whitespace-nowrap`}>
      {STATUS_LABELS[next]}にする
    </button>
  );
}
