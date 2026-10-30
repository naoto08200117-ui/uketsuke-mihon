"use client";

import { useState } from "react";
import type { Reservation } from "@/types/reservation";
import MessageArea from "@/components/MessageArea";
import ApplyForm from "@/components/form/ApplyForm";
import ApplyDone from "@/components/form/ApplyDone";
import { RESERVATIONS_MAX } from "@/lib/limits";
import { LESSON_CAPACITY } from "@/lib/lessons";
import { remainingSeats } from "@/lib/seats";
import { updateReservations } from "@/lib/reservationStorage";
import { sameContactField, type ApplyError, type ApplyInput } from "@/lib/reservationValidate";
import { STORAGE_NOTICE_TEXT, useReservations } from "@/lib/useReservations";

// ①申込フォーム／完了。完了の表示はこの画面の中だけに持つ（F5 でフォームに戻る）
export default function ApplyPage() {
  const snapshot = useReservations();
  const loaded = snapshot.loading ? null : snapshot;
  const messages = loaded?.notice ? [STORAGE_NOTICE_TEXT[loaded.notice]] : [];
  const [done, setDone] = useState<Reservation | null>(null);

  // 「申し込む」を押した時だけ動く（id と今の時刻はブラウザの操作の中で作る）。
  // 残り席（F-16）・同じ連絡先（F-17）・件数（F-18）は、保存の直前に読み直したデータで F3 の順に確かめる
  function submit(input: ApplyInput): ApplyError | null {
    const now = new Date().toISOString();
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      lessonDate: input.lessonDate,
      people: input.people,
      request: input.request,
      status: "new",
      memo: "",
      createdAt: now,
      updatedAt: now,
      history: [{ from: null, to: "new", at: now, via: "form" }],
    };
    // 関数の外に結果を持ち出すための入れ物
    const outcome: { error: ApplyError | null } = { error: null };
    updateReservations((current) => {
      const remaining = remainingSeats(current, input.lessonDate);
      if (input.people > remaining) {
        outcome.error = { code: "seats", remaining: Math.max(remaining, 0) };
        return null;
      }
      for (const r of current) {
        const field = r.lessonDate === input.lessonDate && r.status !== "canceled" ? sameContactField(input, r) : null;
        if (field) {
          outcome.error = { code: "duplicate", field };
          return null;
        }
      }
      if (current.length >= RESERVATIONS_MAX) {
        outcome.error = { code: "limit" };
        return null;
      }
      return [...current, reservation];
    });
    if (outcome.error === null) setDone(reservation);
    return outcome.error;
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      {done ? (
        <>
          <ApplyDone reservation={done} onAgain={() => setDone(null)} />
          <MessageArea messages={messages} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h1 className="border-b-4 border-accent pb-2 text-title font-bold text-ink">体験レッスンのお申し込み</h1>
            <p className="text-body text-ink">
              みほん料理教室（サンプル）の体験レッスン「だしと季節の和食」です。時間は10:00〜12:00、各日{LESSON_CAPACITY}人までです。
            </p>
            <p className="text-body text-ink">本物のお名前・電話番号・メールアドレスは入れないでください。</p>
          </div>
          <MessageArea messages={messages} />
          <ApplyForm reservations={loaded ? loaded.reservations : null} onSubmit={submit} />
        </>
      )}
    </div>
  );
}
