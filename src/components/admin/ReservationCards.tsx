import type { Reservation } from "@/types/reservation";
import { formatLessonDate } from "@/lib/dateFormat";
import StatusBadge from "@/components/StatusBadge";
import NextStatusButton from "@/components/admin/NextStatusButton";
import { ContactLines, DetailLink, NameText } from "@/components/admin/ReservationTable";

type Props = { reservations: readonly Reservation[]; onChanged: (message: string) => void };

// F6：スマホ（幅768px未満）の一覧。1件ずつ line の枠で囲む（角丸・影・背景なし。中に札とボタンの枠だけ）
export default function ReservationCards({ reservations, onChanged }: Props) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {reservations.map((r) => (
        <li key={r.id} className="flex flex-col gap-1 border border-line p-3 text-body text-ink">
          <div className="flex items-start justify-between gap-3">
            <NameText reservation={r} />
            <StatusBadge status={r.status} />
          </div>
          <p className="tabular-nums">
            {formatLessonDate(r.lessonDate)}・{r.people}人
          </p>
          <ContactLines reservation={r} />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <NextStatusButton reservation={r} onChanged={onChanged} />
            <DetailLink id={r.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
