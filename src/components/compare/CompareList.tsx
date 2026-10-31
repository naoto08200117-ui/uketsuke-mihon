import type { Reservation } from "@/types/reservation";
import { SEED_RESERVATIONS } from "@/lib/seed";
import { formatLessonDate } from "@/lib/dateFormat";
import StatusBadge from "@/components/StatusBadge";
import { NameText } from "@/components/admin/ReservationTable";

const cell = "border-b border-line py-3 pr-4 text-left align-top font-normal";

// 文字の順で比べる（localeCompare は Intl の並べ方に左右されるので使わない）
function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// 並びは F6 と同じ（希望日の古い順 → 申込日時の古い順）
const ROWS: readonly Reservation[] = [...SEED_RESERVATIONS].sort(
  (a, b) => compareText(a.lessonDate, b.lessonDate) || compareText(a.createdAt, b.createdAt),
);

// F17 の右側：localStorage ではなく固定の架空の10件を、読むだけの4列で出す
// （管理一覧で状態を変えても変わらない。次の操作のボタン・詳細のリンクは出さない）
export default function CompareList() {
  return (
    <>
      <table className="hidden w-full border-t border-line text-body text-ink md:table">
        <thead>
          <tr>
            <th scope="col" className={cell}>希望日</th>
            <th scope="col" className={cell}>お名前</th>
            <th scope="col" className={cell}>人数</th>
            <th scope="col" className={cell}>状態</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.id}>
              <td className={`${cell} whitespace-nowrap`}>{formatLessonDate(r.lessonDate)}</td>
              <th scope="row" className={cell}><NameText reservation={r} /></th>
              <td className={`${cell} whitespace-nowrap tabular-nums`}>{r.people}人</td>
              <td className={cell}><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 768px 未満は1件ずつの枠（1行目にお名前と状態の札、2行目に希望日・人数） */}
      <ul className="flex flex-col gap-3 md:hidden">
        {ROWS.map((r) => (
          <li key={r.id} className="flex flex-col gap-1 border border-line p-3 text-body text-ink">
            <div className="flex items-start justify-between gap-3">
              <NameText reservation={r} />
              <StatusBadge status={r.status} />
            </div>
            <p className="tabular-nums">
              {formatLessonDate(r.lessonDate)}・{r.people}人
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
