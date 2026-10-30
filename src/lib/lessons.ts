import type { Lesson } from "@/types/reservation";

// 開催日（7日、すべて土曜）。コードに固定し、画面からは変えない（要件定義書7章）
export const LESSON_CAPACITY = 8;

export const LESSONS: readonly Lesson[] = [
  { date: "2026-10-24", capacity: LESSON_CAPACITY },
  { date: "2026-11-14", capacity: LESSON_CAPACITY },
  { date: "2026-11-21", capacity: LESSON_CAPACITY },
  { date: "2026-11-28", capacity: LESSON_CAPACITY },
  { date: "2026-12-05", capacity: LESSON_CAPACITY },
  { date: "2026-12-12", capacity: LESSON_CAPACITY },
  { date: "2026-12-19", capacity: LESSON_CAPACITY },
];

export function isLessonDate(date: string): boolean {
  return LESSONS.some((lesson) => lesson.date === date);
}
