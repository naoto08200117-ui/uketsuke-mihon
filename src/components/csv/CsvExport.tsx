"use client";

import type { Reservation } from "@/types/reservation";
import { buildCsv, csvFileName } from "@/lib/csvFormat";
import { secondaryButtonClass } from "@/components/form/Field";

// F15：CSV に書き出す。絞り込み・検索に関係なく全件を書き出す（保存はしないので、読むだけ）
export default function CsvExport({ reservations }: { reservations: readonly Reservation[] }) {
  function exportCsv() {
    // 今の時刻はブラウザ側の操作の中だけで使う（ファイル名の日付）
    const blob = new Blob([buildCsv(reservations)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = csvFileName(Date.now());
    document.body.appendChild(link);
    link.click();
    link.remove();
    // 保存が始まってから URL を手放す（すぐ手放すと保存が始まらないブラウザがあるため）
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button type="button" onClick={exportCsv} className={secondaryButtonClass}>
      CSV に書き出す
    </button>
  );
}
