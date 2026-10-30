// データの形（要件定義書5章）

// 画面の名前：新規／連絡済み／確定／完了／キャンセル
export type Status = "new" | "contacted" | "confirmed" | "done" | "canceled";

// きっかけ：申込フォーム／ボタン／1つ前に戻す／CSV の読み込み／架空のデータ
export type ChangeVia = "form" | "button" | "undo" | "csv" | "seed";

export type People = 1 | 2 | 3 | 4;

export type StatusChange = {
  // null があってよいのは1行目だけ。50行に切り詰めた後は1行目も null でなくてよい
  from: Status | null;
  to: Status;
  at: string; // toISOString() の形
  via: ChangeVia;
};

export type Reservation = {
  id: string; // ^[A-Za-z0-9-]{1,64}$
  name: string;
  email: string;
  phone: string;
  lessonDate: string; // "YYYY-MM-DD"
  people: People;
  request: string;
  status: Status;
  memo: string;
  createdAt: string;
  updatedAt: string;
  history: StatusChange[];
};

export type ReservationStore = { version: 1; reservations: Reservation[] };

// 曜日は持たず dateFormat.ts で計算する
export type Lesson = { date: string; capacity: number };
