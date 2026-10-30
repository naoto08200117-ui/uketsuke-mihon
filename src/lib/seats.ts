import type { Reservation } from "@/types/reservation";
import { LESSONS } from "@/lib/lessons";

export type SeatRow = { date: string; booked: number; remaining: number };

// キャンセル以外の申込の人数の合計
export function bookedPeople(reservations: readonly Reservation[], date: string): number {
  return reservations
    .filter((r) => r.lessonDate === date && r.status !== "canceled")
    .reduce((sum, r) => sum + r.people, 0);
}

// 残り＝定員−合計。マイナスは「定員超え」（CSV で超えた分を読み込んだとき）
export function remainingSeats(reservations: readonly Reservation[], date: string): number {
  const lesson = LESSONS.find((l) => l.date === date);
  if (!lesson) return 0;
  return lesson.capacity - bookedPeople(reservations, date);
}

export function seatRows(reservations: readonly Reservation[]): SeatRow[] {
  return LESSONS.map((lesson) => {
    const booked = bookedPeople(reservations, lesson.date);
    return { date: lesson.date, booked, remaining: lesson.capacity - booked };
  });
}
