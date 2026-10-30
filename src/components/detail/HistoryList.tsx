import type { StatusChange } from "@/types/reservation";
import { formatDateTime } from "@/lib/dateFormat";
import { STATUS_LABELS, VIA_LABELS } from "@/lib/status";

// R-06 の形の1行。50行に切り詰めた後は1行目の from が null でないこともある（そのときは「前 → 次」の形）
function rowText(row: StatusChange): string {
  const at = formatDateTime(row.at);
  const to = STATUS_LABELS[row.to];
  const via = VIA_LABELS[row.via];
  if (row.via === "csv") return `${at} CSV から読み込み（${to}）`;
  if (row.from !== null) return `${at} ${STATUS_LABELS[row.from]} → ${to}（${via}）`;
  if (row.to === "new") return `${at} 申込（${via}）`;
  return `${at} 申込 → ${to}（${via}）`;
}

// F14：状態の記録を古い順に（1件につき最大50行）
export default function HistoryList({ history }: { history: readonly StatusChange[] }) {
  return (
    <section aria-labelledby="history-heading" className="flex flex-col gap-3">
      <h2 id="history-heading" className="text-body font-bold text-ink">
        状態の記録
      </h2>
      <ol className="flex flex-col border-t border-line">
        {history.map((row, index) => (
          // 記録の行には id がなく、並びは古い順で変わらないので、位置と日時を鍵にする
          <li key={`${index}-${row.at}`} className="border-b border-line py-2 text-body text-ink tabular-nums">
            {rowText(row)}
          </li>
        ))}
      </ol>
    </section>
  );
}
