import Link from "next/link";
import type { Reservation } from "@/types/reservation";
import { formatLessonDate } from "@/lib/dateFormat";
import StatusBadge from "@/components/StatusBadge";
import NextStatusButton from "@/components/admin/NextStatusButton";

const cell = "border-b border-line py-3 pr-4 text-left align-top font-normal";

// キャンセルは muted＋名前に取り消し線（DESIGN.md の追記）
export function NameText({ reservation }: { reservation: Reservation }) {
  const canceled = reservation.status === "canceled";
  return <span className={`wrap-anywhere ${canceled ? "text-muted line-through" : "text-ink"}`}>{reservation.name}</span>;
}

// 連絡先は、あるものだけを縦に並べる（どちらもあれば2行）
export function ContactLines({ reservation }: { reservation: Reservation }) {
  return (
    <span className="flex flex-col">
      {reservation.email ? <span className="wrap-anywhere">{reservation.email}</span> : null}
      {reservation.phone ? <span className="tabular-nums">{reservation.phone}</span> : null}
    </span>
  );
}

// 詳細へのリンク。文字列をつなげず URL のオブジェクトで渡す（basePath と id の符号化は Next.js が行う）。accent は使わない
export function DetailLink({ id }: { id: string }) {
  return (
    <Link
      href={{ pathname: "/admin/detail/", query: { id } }}
      className="inline-flex min-h-6 min-w-6 items-center text-body text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      詳細
    </Link>
  );
}

type Props = { reservations: readonly Reservation[]; onChanged: (message: string) => void };

// F6：PC（幅768px以上）の一覧の表。768px 未満は ReservationCards を出す
export default function ReservationTable({ reservations, onChanged }: Props) {
  return (
    <table className="hidden w-full border-t border-line text-body text-ink md:table">
      <thead>
        <tr>
          <th scope="col" className={cell}>希望日</th>
          <th scope="col" className={cell}>お名前</th>
          <th scope="col" className={cell}>人数</th>
          <th scope="col" className={cell}>連絡先</th>
          <th scope="col" className={cell}>状態</th>
          <th scope="col" className={cell}>次の操作</th>
        </tr>
      </thead>
      <tbody>
        {reservations.map((r) => (
          <tr key={r.id}>
            <td className={`${cell} whitespace-nowrap`}>{formatLessonDate(r.lessonDate)}</td>
            <th scope="row" className={cell}><NameText reservation={r} /></th>
            <td className={`${cell} whitespace-nowrap tabular-nums`}>{r.people}人</td>
            <td className={cell}><ContactLines reservation={r} /></td>
            <td className={cell}><StatusBadge status={r.status} /></td>
            <td className={cell}>
              <span className="flex flex-wrap items-center gap-3">
                <NextStatusButton reservation={r} onChanged={onChanged} />
                <DetailLink id={r.id} />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
