import type { Reservation, Status, StatusChange } from "@/types/reservation";

// 架空の10件（要件定義書7章）。名前・連絡先はすべて架空。
// 日時は日本時間から9時間引いた UTC の toISOString() の形で書く（例：10/26 22:10 JST → 13:10Z）。

type Step = [from: Status | null, to: Status, at: string];

function build(
  base: Omit<Reservation, "status" | "memo" | "request" | "createdAt" | "updatedAt" | "history"> & {
    request?: string;
    memo?: string;
  },
  steps: Step[],
): Reservation {
  const history: StatusChange[] = steps.map(([from, to, at]) => ({ from, to, at, via: "seed" }));
  return {
    id: base.id,
    name: base.name,
    email: base.email,
    phone: base.phone,
    lessonDate: base.lessonDate,
    people: base.people,
    request: base.request ?? "",
    status: history[history.length - 1].to,
    memo: base.memo ?? "",
    createdAt: history[0].at,
    updatedAt: history[history.length - 1].at,
    history,
  };
}

export const SEED_RESERVATIONS: readonly Reservation[] = [
  build(
    { id: "seed-01", name: "青木 さくら", email: "aoki@example.com", phone: "", lessonDate: "2026-10-24", people: 2, request: "包丁を持つのが久しぶりです" },
    [
      [null, "new", "2026-10-02T00:15:00.000Z"],
      ["new", "contacted", "2026-10-02T05:00:00.000Z"],
      ["contacted", "confirmed", "2026-10-03T01:30:00.000Z"],
      ["confirmed", "done", "2026-10-24T03:30:00.000Z"],
    ],
  ),
  build(
    { id: "seed-02", name: "井上 健太", email: "", phone: "000-0000-0002", lessonDate: "2026-10-24", people: 1 },
    [
      [null, "new", "2026-10-04T11:40:00.000Z"],
      ["new", "contacted", "2026-10-05T01:05:00.000Z"],
      ["contacted", "confirmed", "2026-10-05T01:20:00.000Z"],
      ["confirmed", "done", "2026-10-24T03:35:00.000Z"],
    ],
  ),
  build(
    { id: "seed-03", name: "上田 美咲", email: "ueda@example.com", phone: "", lessonDate: "2026-11-21", people: 2, memo: "体調のため。別の日を検討中" },
    [
      [null, "new", "2026-10-07T02:20:00.000Z"],
      ["new", "canceled", "2026-10-09T07:45:00.000Z"],
    ],
  ),
  build(
    { id: "seed-04", name: "江口 直子", email: "", phone: "000-0000-0004", lessonDate: "2026-11-28", people: 3, request: "子ども（小学生）も一緒です" },
    [
      [null, "new", "2026-10-09T23:50:00.000Z"],
      ["new", "contacted", "2026-10-10T04:10:00.000Z"],
      ["contacted", "confirmed", "2026-10-11T00:40:00.000Z"],
    ],
  ),
  build(
    { id: "seed-05", name: "小野 翔", email: "ono@example.com", phone: "", lessonDate: "2026-11-28", people: 1 },
    [
      [null, "new", "2026-10-12T12:05:00.000Z"],
      ["new", "contacted", "2026-10-13T01:00:00.000Z"],
      ["contacted", "confirmed", "2026-10-13T06:30:00.000Z"],
    ],
  ),
  build(
    { id: "seed-06", name: "加藤 由美", email: "kato@example.com", phone: "000-0000-0006", lessonDate: "2026-12-05", people: 4 },
    [
      [null, "new", "2026-10-15T03:10:00.000Z"],
      ["new", "contacted", "2026-10-15T08:00:00.000Z"],
      ["contacted", "confirmed", "2026-10-16T02:00:00.000Z"],
    ],
  ),
  build(
    { id: "seed-07", name: "木村 陽菜", email: "", phone: "000-0000-0007", lessonDate: "2026-12-05", people: 4, request: "卵のアレルギーがあります" },
    [
      [null, "new", "2026-10-18T10:30:00.000Z"],
      ["new", "contacted", "2026-10-19T01:15:00.000Z"],
    ],
  ),
  build(
    { id: "seed-08", name: "工藤 誠", email: "kudo@example.com", phone: "", lessonDate: "2026-12-12", people: 2, memo: "12/5 が満席のため 12/12 をご案内" },
    [
      [null, "new", "2026-10-21T01:40:00.000Z"],
      ["new", "contacted", "2026-10-21T06:20:00.000Z"],
    ],
  ),
  build(
    { id: "seed-09", name: "佐藤 葵", email: "", phone: "000-0000-0009", lessonDate: "2026-12-12", people: 1 },
    [[null, "new", "2026-10-26T13:10:00.000Z"]],
  ),
  build(
    { id: "seed-10", name: "清水 大輔", email: "shimizu@example.com", phone: "", lessonDate: "2026-12-19", people: 2 },
    [[null, "new", "2026-10-28T00:05:00.000Z"]],
  ),
];
