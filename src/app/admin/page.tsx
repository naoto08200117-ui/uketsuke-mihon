"use client";

import MessageArea from "@/components/MessageArea";
import SeatSummary from "@/components/admin/SeatSummary";
import { STORAGE_NOTICE_TEXT, useReservations } from "@/lib/useReservations";

// T02：見出しと「開催日ごとの残り席」だけ（一覧などは T04 で足す）
export default function AdminPage() {
  const snapshot = useReservations();
  const loaded = snapshot.loading ? null : snapshot;
  const messages = loaded?.notice ? [STORAGE_NOTICE_TEXT[loaded.notice]] : [];

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <h1 className="border-b-4 border-accent pb-2 text-title font-bold text-ink">申込の管理</h1>
      <MessageArea messages={messages} />
      <SeatSummary reservations={loaded ? loaded.reservations : null} />
    </div>
  );
}
