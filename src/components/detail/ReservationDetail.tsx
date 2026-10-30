"use client";

import type { MouseEvent, ReactNode } from "react";
import type { Reservation } from "@/types/reservation";
import { formatDateTime, formatLessonDate } from "@/lib/dateFormat";
import { STATUS_LABELS, canCancel, cancelStatus, nextStatus, undoStatus, undoTarget } from "@/lib/status";
import { updateReservations } from "@/lib/reservationStorage";
import StatusBadge from "@/components/StatusBadge";
import NextStatusButton from "@/components/admin/NextStatusButton";
import { NameText } from "@/components/admin/ReservationTable";
import { secondaryButtonClass } from "@/components/form/Field";

const NO_SEATS_TEXT = "この日は残りの席が足りないため、キャンセルを戻せません。";

type Props = {
  reservation: Reservation;
  onNotice: (text: string) => void;
  onError: (text: string) => void;
};

// R-02 の項目1つ。空の項目は「—」
function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="text-body text-ink">{children}</dd>
    </div>
  );
}

// F11：申込の全項目（変えられない）と、状態の操作（次の操作・キャンセルにする・1つ前に戻す。どれも2つ目のボタン）
export default function ReservationDetail({ reservation: r, onNotice, onError }: Props) {
  // 押した時に見えていた状態（ボタンの元の状態）
  const shown = r.status;
  const canUndo = undoTarget(r.history) !== null;

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    // ダブルクリックの2回目などは何もしない。Enter・Space は detail が 0 なので効く
    if (event.detail >= 2) return;
    const at = new Date().toISOString();
    const result = updateReservations((current) => cancelStatus(current, r.id, shown, at));
    if (result !== "unchanged") onNotice(`「${r.name}」を${STATUS_LABELS.canceled}にしました。`);
  }

  function handleUndo(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail >= 2) return;
    const at = new Date().toISOString();
    // 関数の外に「席が足りない」と戻した先を持ち出すための入れ物
    const outcome: { noSeats: boolean; to: string | null } = { noSeats: false, to: null };
    const result = updateReservations((current) => {
      const next = undoStatus(current, r.id, shown, at);
      if (next === "noSeats") {
        outcome.noSeats = true;
        return null;
      }
      const after = next?.find((x) => x.id === r.id);
      if (after) outcome.to = STATUS_LABELS[after.status];
      return next;
    });
    if (outcome.noSeats) onError(NO_SEATS_TEXT);
    else if (result !== "unchanged" && outcome.to) onNotice(`「${r.name}」を${outcome.to}にしました。`);
  }

  return (
    <dl className="flex flex-col border-t border-line">
      <Item label="お名前"><NameText reservation={r} /></Item>
      <Item label="希望日">{formatLessonDate(r.lessonDate)}</Item>
      <Item label="人数"><span className="tabular-nums">{r.people}人</span></Item>
      <Item label="メールアドレス"><span className="wrap-anywhere">{r.email || "—"}</span></Item>
      <Item label="電話番号"><span className="tabular-nums">{r.phone || "—"}</span></Item>
      <Item label="ご要望"><span className="whitespace-pre-wrap wrap-anywhere">{r.request || "—"}</span></Item>
      <Item label="申込日時"><span className="tabular-nums">{formatDateTime(r.createdAt)}</span></Item>
      <Item label="状態">
        <span className="flex flex-col items-start gap-3">
          <StatusBadge status={r.status} />
          <span className="flex flex-wrap gap-3">
            {nextStatus(shown) !== null ? <NextStatusButton reservation={r} onChanged={onNotice} /> : null}
            {canCancel(shown) ? (
              <button type="button" onClick={handleCancel} className={secondaryButtonClass}>
                キャンセルにする
              </button>
            ) : null}
            <button type="button" onClick={handleUndo} disabled={!canUndo} className={secondaryButtonClass}>
              1つ前に戻す
            </button>
          </span>
        </span>
      </Item>
    </dl>
  );
}
