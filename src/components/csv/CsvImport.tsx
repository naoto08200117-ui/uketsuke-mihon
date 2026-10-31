"use client";

import { useRef, useState, type ChangeEvent, type MouseEvent, type ReactNode } from "react";
import type { Reservation } from "@/types/reservation";
import { CSV_MAX_BYTES, RESERVATIONS_MAX } from "@/lib/limits";
import { planAdd, readCsv, type RowError } from "@/lib/csvImport";
import { updateReservations } from "@/lib/reservationStorage";
import MessageArea from "@/components/MessageArea";
import ImportPreview from "@/components/csv/ImportPreview";
import { secondaryButtonClass } from "@/components/form/Field";

const V10 = "1MB までの CSV を選んでください。";
const V11 = "1行目の見出しが合いません。必要な見出し：お名前・メール・電話・希望日・人数";
const V12 = "読み込める行がありませんでした。今のデータは変わっていません。";
const V14 = "合わせて300件を超えるため、読み込めません。今のデータは変わっていません。";
const V15 = "このファイルは読み込めません。CSV（1MB まで、1000行まで）を選んでください。";
const V13_TAIL = "試したデータは「架空のデータに戻す」で消せます。";

// error＝V-10・V-11・V-14・V-15（danger）／done＝V-13（ink）／preview＝V-04〜V-07
type View =
  | { kind: "none" }
  | { kind: "error"; text: string }
  | { kind: "done"; text: string }
  | { kind: "preview"; key: number; rows: Reservation[]; errors: RowError[] };

// F16：CSV を読み込む。children は同じ行に並べるボタン（CSV に書き出す）
export default function CsvImport({ currentCount, children }: { currentCount: number; children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  // 前に選んだファイルの読み込みが後から終わっても、表示に混ぜないための番号
  const readCount = useRef(0);
  const [view, setView] = useState<View>({ kind: "none" });

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // 新しいファイルを選んだら、前の V-04〜V-15 の表示を消してから読む
    setView({ kind: "none" });
    const key = ++readCount.current;
    if (!file) return;
    let buffer: ArrayBuffer | null = null;
    // 1MB を超えたら読む前に止める（V-10）
    if (file.size <= CSV_MAX_BYTES) buffer = await file.arrayBuffer().catch(() => null);
    // 同じファイルを選び直しても読み込めるように、読んだ後は選択欄を空にする
    input.value = "";
    if (key !== readCount.current) return;
    if (file.size > CSV_MAX_BYTES) return setView({ kind: "error", text: V10 });
    // 今の時刻と新しい id はブラウザ側の操作の中だけで作る
    const result = buffer ? readCsv(buffer, new Date().toISOString(), () => crypto.randomUUID()) : { kind: "unreadable" as const };
    if (result.kind === "unreadable") return setView({ kind: "error", text: V15 });
    if (result.kind === "badHeader") return setView({ kind: "error", text: V11 });
    setView({ kind: "preview", key, rows: result.rows, errors: result.errors });
  }

  // 「今のデータに足す」：1回だけ効く。押したら結果の表示を閉じ、V-13 か V-14 だけを出す
  function add(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail >= 2 || view.kind !== "preview") return;
    const rows = view.rows;
    const outcome: { plan: ReturnType<typeof planAdd> } = { plan: null };
    // 足す件数と300件は、保存の直前に読み直したデータで確かめる
    updateReservations((current) => {
      outcome.plan = planAdd(current, rows);
      return outcome.plan ? outcome.plan.next : null;
    });
    const plan = outcome.plan;
    if (!plan) return setView({ kind: "error", text: V14 });
    setView({ kind: "done", text: `${plan.added}件を足しました（同じ id の${plan.skipped}件は飛ばしました）。${V13_TAIL}` });
  }

  // V-07 の「置き換える」：1回だけ効く。読み直した上で300件を確かめ直してから書く
  function replace(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail >= 2 || view.kind !== "preview") return;
    const rows = view.rows;
    const outcome = { tooMany: false };
    updateReservations(() => {
      outcome.tooMany = rows.length > RESERVATIONS_MAX;
      return outcome.tooMany ? null : [...rows];
    });
    if (outcome.tooMany) return setView({ kind: "error", text: V14 });
    setView({ kind: "done", text: `${rows.length}件に置き換えました。${V13_TAIL}` });
  }

  const messages = view.kind === "error" ? [view.text] : view.kind === "preview" && view.rows.length === 0 ? [V12] : [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {children}
        <button type="button" onClick={() => inputRef.current?.click()} className={secondaryButtonClass}>
          CSV を読み込む
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" tabIndex={-1} aria-label="CSV を読み込む" />
      </div>
      <MessageArea messages={messages} notices={view.kind === "done" ? [view.text] : []} />
      {view.kind === "preview" ? (
        <ImportPreview
          key={view.key}
          rowCount={view.rows.length}
          errors={view.errors}
          currentCount={currentCount}
          onAdd={add}
          onReplace={replace}
          onTooMany={() => setView({ kind: "error", text: V14 })}
          onClose={() => setView({ kind: "none" })}
        />
      ) : null}
    </div>
  );
}
