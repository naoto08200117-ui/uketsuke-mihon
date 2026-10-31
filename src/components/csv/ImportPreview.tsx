"use client";

import { useState, type MouseEvent } from "react";
import type { RowError } from "@/lib/csvImport";
import { CSV_ERRORS_SHOWN, RESERVATIONS_MAX } from "@/lib/limits";
import { secondaryButtonClass } from "@/components/form/Field";

type Click = (event: MouseEvent<HTMLButtonElement>) => void;

// V-04〜V-07：読み込みの結果を先に見せてから、足す・置き換える・やめるを選ばせる。
// 読み込める行が0件なら選ぶボタンは出さない（V-12 は CsvImport が出す）
export default function ImportPreview({
  rowCount,
  errors,
  currentCount,
  onAdd,
  onReplace,
  onTooMany,
  onClose,
}: {
  rowCount: number;
  errors: readonly RowError[];
  currentCount: number;
  onAdd: Click;
  onReplace: Click;
  onTooMany: () => void;
  onClose: () => void;
}) {
  // V-07（置き換えの確認）を出しているか
  const [confirming, setConfirming] = useState(false);
  const shown = errors.slice(0, CSV_ERRORS_SHOWN);
  const rest = errors.length - shown.length;

  function askReplace(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail >= 2) return;
    // ①読み込める行が300件を超えれば、V-07 を出さずに V-14
    if (rowCount > RESERVATIONS_MAX) onTooMany();
    else setConfirming(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body text-ink tabular-nums">
        読み込める行：{rowCount}件／読み込めない行：{errors.length}件
      </p>
      {errors.length > 0 ? (
        <ul className="flex flex-col text-body text-ink tabular-nums">
          {shown.map((e) => (
            <li key={e.line}>
              {e.line}行目：{e.reason}
            </li>
          ))}
          {rest > 0 ? <li>ほか{rest}行</li> : null}
        </ul>
      ) : null}
      {rowCount > 0 && !confirming ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onAdd} className={secondaryButtonClass}>
            今のデータに足す
          </button>
          <button type="button" onClick={askReplace} className={secondaryButtonClass}>
            今のデータと置き換える
          </button>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            やめる
          </button>
        </div>
      ) : null}
      {confirming ? (
        <div className="flex flex-col gap-3">
          <p className="text-body text-ink">
            今の{currentCount}件を消して、CSV の{rowCount}件に置き換えます。元に戻せません。
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onReplace} className={secondaryButtonClass}>
              置き換える
            </button>
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              やめる
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
