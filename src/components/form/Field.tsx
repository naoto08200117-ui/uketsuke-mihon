import type { ReactNode } from "react";

// 入力欄・選択欄に共通の見た目（DESIGN.md の入力欄とフォーカスの枠）
export const controlClass =
  "min-h-12 w-full rounded-control border border-line bg-surface px-3 text-body text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// ラベルと、行の右端の文字数（F-08「{n}/{上限}」）。入力欄そのものは children で受け取る
export default function Field({
  htmlFor,
  label,
  count,
  children,
}: {
  htmlFor: string;
  label: string;
  count?: { length: number; max: number };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={htmlFor} className="text-body text-ink">
          {label}
        </label>
        {count ? (
          <span className="text-small text-muted tabular-nums">
            {count.length}/{count.max}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
