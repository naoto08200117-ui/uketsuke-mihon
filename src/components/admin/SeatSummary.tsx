import type { Reservation } from "@/types/reservation";
import { LESSONS } from "@/lib/lessons";
import { seatRows } from "@/lib/seats";
import { formatLessonDate } from "@/lib/dateFormat";

const cell = "border-b border-line py-3 pr-6 text-left font-normal";

// A-03：{n}席／満席（muted）／定員超え {n}人（ink の普通の文字）
function Remaining({ remaining }: { remaining: number }) {
  if (remaining > 0) return <>{remaining}席</>;
  if (remaining === 0) return <span className="text-muted">満席</span>;
  return <>定員超え {-remaining}人</>;
}

// F5：開催日ごとの残り席。読み込み中（reservations が null）は日付だけ出し、数は出さない（高さを保つため）
export default function SeatSummary({ reservations }: { reservations: readonly Reservation[] | null }) {
  const rows = reservations ? seatRows(reservations) : null;
  return (
    <section aria-labelledby="seat-summary-heading" className="flex flex-col gap-3">
      <h2 id="seat-summary-heading" className="text-body font-bold text-ink">
        開催日ごとの残り席
      </h2>
      <table className="border-t border-line text-body text-ink tabular-nums">
        <thead>
          <tr>
            <th scope="col" className={cell}>開催日</th>
            <th scope="col" className={cell}>申込</th>
            <th scope="col" className={cell}>残り</th>
          </tr>
        </thead>
        <tbody>
          {LESSONS.map((lesson, i) => (
            <tr key={lesson.date}>
              <th scope="row" className={cell}>{formatLessonDate(lesson.date)}</th>
              <td className={cell}>{rows ? `${rows[i].booked}人` : null}</td>
              <td className={cell}>{rows ? <Remaining remaining={rows[i].remaining} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
