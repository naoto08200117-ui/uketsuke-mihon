"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MessageArea from "@/components/MessageArea";
import ReservationDetail from "@/components/detail/ReservationDetail";
import MemoField from "@/components/detail/MemoField";
import HistoryList from "@/components/detail/HistoryList";
import { isValidId } from "@/lib/reservationValidate";
import { STORAGE_NOTICE_TEXT, useReservations } from "@/lib/useReservations";

const NOT_FOUND_TEXT = "この申込は見つかりません。「管理一覧に戻る」から選び直してください。";

// 最後に出した文言1つ。error は R-07（danger）、そうでなければ A-09（ink）
type ActionMessage = { text: string; error: boolean };

// クエリの id を読む部分。useSearchParams は書き出しの時に値がないため、外側の <Suspense> の中に置く
function DetailContent() {
  const rawId = useSearchParams().get("id");
  const snapshot = useReservations();
  const [action, setAction] = useState<ActionMessage | null>(null);

  // 読み込み中は高さだけ確保する
  if (snapshot.loading) return <div className="min-h-12" />;

  // id の形（^[A-Za-z0-9-]{1,64}$）を確かめてから探す。合わない・見つからない（別のタブで消えた）なら R-05
  const id = isValidId(rawId) ? rawId : null;
  const reservation = id === null ? undefined : snapshot.reservations.find((r) => r.id === id);

  const messages = [
    ...(snapshot.notice ? [STORAGE_NOTICE_TEXT[snapshot.notice]] : []),
    ...(reservation ? [] : [NOT_FOUND_TEXT]),
    ...(action?.error ? [action.text] : []),
  ];
  // 成功のお知らせは赤にしない（DESIGN.md「体験レッスン受付で足したもの」）
  const notices = action && !action.error ? [action.text] : [];

  return (
    <>
      <MessageArea messages={messages} notices={notices} />
      {reservation ? (
        <>
          <ReservationDetail
            reservation={reservation}
            onNotice={(text) => setAction({ text, error: false })}
            onError={(text) => setAction({ text, error: true })}
          />
          <MemoField reservation={reservation} />
          <HistoryList history={reservation.history} />
        </>
      ) : null}
    </>
  );
}

// ③詳細（F11〜F14）。URL は /admin/detail/?id=...（動的なページは作らない）
export default function DetailPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="border-b-4 border-accent pb-2 text-title font-bold text-ink">申込の詳細</h1>
        <Link
          href="/admin/"
          className="inline-flex min-h-6 min-w-6 items-center text-body text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          管理一覧に戻る
        </Link>
      </div>
      <Suspense fallback={<div className="min-h-12" />}>
        <DetailContent />
      </Suspense>
    </div>
  );
}
