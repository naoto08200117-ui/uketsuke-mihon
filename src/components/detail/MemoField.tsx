"use client";

import type { ChangeEvent } from "react";
import type { Reservation } from "@/types/reservation";
import { MEMO_MAX } from "@/lib/limits";
import { updateReservations } from "@/lib/reservationStorage";
import Field, { controlClass } from "@/components/form/Field";

// F13：メモ（500字まで・改行可）。入力のたびに、読み直したデータのその申込のメモだけを変えて保存する。
// 状態・updatedAt・記録は変えない。値は保存したデータから読むので、別のタブで変わったメモも映る
export default function MemoField({ reservation }: { reservation: Reservation }) {
  const { id, memo } = reservation;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value.slice(0, MEMO_MAX);
    updateReservations((current) => {
      const target = current.find((r) => r.id === id);
      // 読み直したら申込がない・変えるものがないときは書かない
      if (!target || target.memo === value) return null;
      return current.map((r) => (r.id === id ? { ...r, memo: value } : r));
    });
  }

  return (
    <Field htmlFor="detail-memo" label="メモ（お客さまには見えません）" count={{ length: memo.length, max: MEMO_MAX }}>
      <textarea
        id="detail-memo"
        value={memo}
        maxLength={MEMO_MAX}
        rows={4}
        onChange={handleChange}
        className={`${controlClass} py-3`}
      />
    </Field>
  );
}
