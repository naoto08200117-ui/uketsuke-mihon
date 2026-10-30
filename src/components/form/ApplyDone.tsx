"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Reservation } from "@/types/reservation";
import { formatLessonDate } from "@/lib/dateFormat";
import { secondaryButtonClass as secondaryButton } from "@/components/form/Field";

// F4：完了の表示（K-01〜K-04）。表示が変わったら K-01 の見出しにフォーカスを移す
export default function ApplyDone({ reservation, onAgain }: { reservation: Reservation; onAgain: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 ref={headingRef} tabIndex={-1} className="border-b-4 border-accent pb-2 text-title font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        お申し込みを受け付けました（デモ）
      </h1>
      <p className="text-body text-ink">
        {formatLessonDate(reservation.lessonDate)} {reservation.people}人　{reservation.name} 様
      </p>
      <p className="text-body text-ink">本番では、ここでお店への知らせなどをつなげます。このデモでは、どこにも送られていません。</p>
      <div className="flex flex-wrap gap-3">
        {/* 詳細へのリンクは文字列をつなげず、URL のオブジェクトで渡す（basePath と id の符号化は Next.js が行う） */}
        <Link href={{ pathname: "/admin/detail/", query: { id: reservation.id } }} className={secondaryButton}>
          お店側で、この申込を見る
        </Link>
        <button type="button" onClick={onAgain} className={secondaryButton}>
          続けて申し込む
        </button>
      </div>
    </div>
  );
}
