"use client";

import { useState } from "react";
import type { Reservation } from "@/types/reservation";
import MessageArea from "@/components/MessageArea";
import SeatSummary from "@/components/admin/SeatSummary";
import StatusFilter, { type StatusFilterValue } from "@/components/admin/StatusFilter";
import SearchBox from "@/components/admin/SearchBox";
import ReservationTable from "@/components/admin/ReservationTable";
import ReservationCards from "@/components/admin/ReservationCards";
import ResetData from "@/components/admin/ResetData";
import { STORAGE_NOTICE_TEXT, useReservations } from "@/lib/useReservations";

// 文字の順で比べる（localeCompare は Intl の並べ方に左右されるので使わない）
function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// F6：希望日の古い順 → 申込日時の古い順（どちらも桁のそろった同じ形の文字なので、文字の順＝日時の順）
function sortForList(reservations: readonly Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => compareText(a.lessonDate, b.lessonDate) || compareText(a.createdAt, b.createdAt));
}

// ②管理一覧（F5〜F10）。CSV（T06・T07）はまだ置かない
export default function AdminPage() {
  const snapshot = useReservations();
  const loaded = snapshot.loading ? null : snapshot;
  const [filter, setFilter] = useState<StatusFilterValue>("all");
  const [search, setSearch] = useState("");
  // A-09・A-11（最後に出したもの1つ）
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const messages = loaded?.notice ? [STORAGE_NOTICE_TEXT[loaded.notice]] : [];
  // 成功のお知らせは赤にしない（DESIGN.md「体験レッスン受付で足したもの」）
  const notices = actionMessage ? [actionMessage] : [];

  const all = loaded ? loaded.reservations : [];
  const query = search.trim();
  const shown = sortForList(all).filter(
    (r) => (filter === "all" || r.status === filter) && (query === "" || r.name.includes(query)),
  );

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <h1 className="border-b-4 border-accent pb-2 text-title font-bold text-ink">申込の管理</h1>
      <MessageArea messages={messages} notices={notices} />
      <SeatSummary reservations={loaded ? loaded.reservations : null} />
      {loaded ? (
        <section aria-label="申込の一覧" className="flex flex-col gap-4">
          <StatusFilter reservations={all} value={filter} onChange={setFilter} />
          <SearchBox value={search} onChange={setSearch} />
          <p className="text-small text-muted tabular-nums">
            {shown.length}件を表示 / 全{all.length}件
          </p>
          {shown.length === 0 ? (
            <p className="text-body text-muted">当てはまる申込はありません。</p>
          ) : (
            <>
              <ReservationTable reservations={shown} onChanged={setActionMessage} />
              <ReservationCards reservations={shown} onChanged={setActionMessage} />
            </>
          )}
          <ResetData onReset={setActionMessage} />
        </section>
      ) : (
        // 読み込み中は一覧を出さず、高さだけ確保する
        <div className="min-h-12" />
      )}
      <p className="text-body text-ink">
        本番では、ログインを付けて、御社のシートやデータベースにつなぎます。開催日・お名前・連絡先はすべて架空です。
      </p>
    </div>
  );
}
