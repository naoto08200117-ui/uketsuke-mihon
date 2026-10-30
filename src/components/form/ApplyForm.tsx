"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Reservation } from "@/types/reservation";
import { LESSONS } from "@/lib/lessons";
import { EMAIL_MAX, NAME_MAX, PEOPLE_OPTIONS, PHONE_DIGITS_MAX, PHONE_DIGITS_MIN, REQUEST_MAX, RESERVATIONS_MAX } from "@/lib/limits";
import { remainingSeats } from "@/lib/seats";
import { formatLessonDate } from "@/lib/dateFormat";
import { checkApplyInput, type ApplyError, type ApplyInput } from "@/lib/reservationValidate";
import Field, { controlClass } from "@/components/form/Field";

type FieldName = "name" | "email" | "phone" | "lessonDate" | "people";

const ERROR_ID = "apply-error";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// F-10・F-12〜F-18（要件定義書11章）
function errorText(error: ApplyError): string {
  switch (error.code) {
    case "nameEmpty": return "お名前を入力してください。";
    case "contactEmpty": return "メールアドレスか電話番号の、どちらかを入力してください。";
    case "emailFormat": return "メールアドレスの形が正しくありません（例：hanako@example.com）。";
    case "phoneFormat": return `電話番号は、数字とハイフンで${PHONE_DIGITS_MIN}〜${PHONE_DIGITS_MAX}桁にしてください（例：000-0000-0000）。`;
    case "dateEmpty": return "希望日を選んでください。";
    case "seats": return `この日は残り${error.remaining}席です。人数を減らすか、別の日を選んでください。`;
    case "duplicate": return "同じ連絡先で、同じ日のお申し込みがすでにあります。";
    case "limit": return `お申し込みは${RESERVATIONS_MAX}件までです（デモの上限）。管理一覧の「架空のデータに戻す」で最初に戻せます。`;
  }
}

// エラーを付ける欄。F-12 はメールの欄、F-16 は人数の欄、F-18 は欄がないので null（メッセージにフォーカスを移す）
function errorField(error: ApplyError): FieldName | null {
  switch (error.code) {
    case "nameEmpty": return "name";
    case "contactEmpty": case "emailFormat": return "email";
    case "phoneFormat": return "phone";
    case "dateEmpty": return "lessonDate";
    case "seats": return "people";
    case "duplicate": return error.field;
    case "limit": return null;
  }
}

// F2・F3：申込フォーム。入力中には確かめず、「申し込む」で確かめる。読み込み中（reservations が null）は希望日の選択肢を出さない
export default function ApplyForm({ reservations, onSubmit }: { reservations: readonly Reservation[] | null; onSubmit: (input: ApplyInput) => ApplyError | null }) {
  const [input, setInput] = useState<ApplyInput>({ name: "", email: "", phone: "", lessonDate: "", people: 1, request: "" });
  const [error, setError] = useState<ApplyError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 2回押しで2件にならないよう、描き直しを待たずに止める
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const set = <K extends keyof ApplyInput>(key: K, value: ApplyInput[K]) => setInput((prev) => ({ ...prev, [key]: value }));
  const field = error ? errorField(error) : null;
  const invalid = (name: FieldName) => (field === name ? { "aria-invalid": true, "aria-describedby": ERROR_ID } : {});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    const checked = checkApplyInput(input);
    const result = checked.ok ? onSubmit(checked.value) : checked.error;
    if (result === null) return; // 成功：画面が完了の表示に変わる
    setError(result);
    submittingRef.current = false;
    setSubmitting(false);
    const target = errorField(result);
    const element = target ? document.getElementById(`apply-${target}`) : errorRef.current;
    element?.focus();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field htmlFor="apply-name" label="お名前（必須）" count={{ length: input.name.length, max: NAME_MAX }}>
        <input id="apply-name" type="text" autoComplete="off" maxLength={NAME_MAX} placeholder="例：見本 花子" value={input.name} onChange={(e) => set("name", e.target.value)} className={controlClass} {...invalid("name")} />
      </Field>
      <div className="flex flex-col gap-3">
        <p className="text-body text-ink">メールか電話番号の、どちらかは必須です。</p>
        <Field htmlFor="apply-email" label="メールアドレス">
          <input id="apply-email" type="text" inputMode="email" autoComplete="off" maxLength={EMAIL_MAX} placeholder="例：hanako@example.com" value={input.email} onChange={(e) => set("email", e.target.value)} className={controlClass} {...invalid("email")} />
        </Field>
        <Field htmlFor="apply-phone" label="電話番号">
          <input id="apply-phone" type="tel" autoComplete="off" placeholder="例：000-0000-0000" value={input.phone} onChange={(e) => set("phone", e.target.value)} className={controlClass} {...invalid("phone")} />
        </Field>
      </div>
      <Field htmlFor="apply-lessonDate" label="希望日（必須）">
        <select id="apply-lessonDate" value={input.lessonDate} onChange={(e) => set("lessonDate", e.target.value)} className={controlClass} {...invalid("lessonDate")}>
          <option value="">選んでください</option>
          {reservations
            ? LESSONS.map((lesson) => {
                const remaining = remainingSeats(reservations, lesson.date);
                // F-06：残り0席以下（定員超えを含む）は「満席」で選べない
                return (
                  <option key={lesson.date} value={lesson.date} disabled={remaining <= 0}>
                    {formatLessonDate(lesson.date)} {remaining > 0 ? `残り${remaining}席` : "満席"}
                  </option>
                );
              })
            : null}
        </select>
      </Field>
      <Field htmlFor="apply-people" label="人数">
        <select id="apply-people" value={input.people} onChange={(e) => set("people", PEOPLE_OPTIONS.find((p) => p === Number(e.target.value)) ?? 1)} className={controlClass} {...invalid("people")}>
          {PEOPLE_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}人</option>
          ))}
        </select>
      </Field>
      <Field htmlFor="apply-request" label="ご要望（任意）" count={{ length: input.request.length, max: REQUEST_MAX }}>
        <textarea id="apply-request" rows={4} maxLength={REQUEST_MAX} placeholder="例：卵のアレルギーがあります" value={input.request} onChange={(e) => set("request", e.target.value)} className={`${controlClass} py-3`} />
      </Field>
      <div role="status">
        <p id={ERROR_ID} ref={errorRef} tabIndex={-1} className={`text-body text-danger ${focusRing}`}>
          {error ? errorText(error) : null}
        </p>
      </div>
      <button type="submit" disabled={submitting} className={`min-h-12 self-start rounded-control bg-accent px-4 text-body text-surface disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-surface disabled:text-muted ${focusRing}`}>
        申し込む
      </button>
    </form>
  );
}
