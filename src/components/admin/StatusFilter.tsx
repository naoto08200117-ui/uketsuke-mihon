import type { Reservation, Status } from "@/types/reservation";
import { STATUSES, STATUS_LABELS } from "@/lib/status";
export type StatusFilterValue = Status | "all";

// 選んでいる絞り込みは accent の枠と字（DESIGN.md の②の振り替え）。選んでいないものは2つ目のボタンと同じ見た目。
// 枠と字の色のクラスを両方付けると、どちらが効くかがクラスの順で決まらないため、片方だけを付ける
const BASE =
  "inline-flex min-h-12 items-center rounded-control border bg-surface px-4 text-body tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const SELECTED = "border-accent text-accent";
const UNSELECTED = "border-line text-ink";

// F8：状態で絞り込む（件数つき。1つだけ選べる）。件数は検索に関係なく全件で数える
export default function StatusFilter({
  reservations,
  value,
  onChange,
}: {
  reservations: readonly Reservation[];
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}) {
  const options: { value: StatusFilterValue; label: string; count: number }[] = [
    { value: "all", label: "すべて", count: reservations.length },
    ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s], count: reservations.filter((r) => r.status === s).length })),
  ];
  return (
    <div role="group" aria-labelledby="status-filter-label" className="flex flex-col gap-2">
      <p id="status-filter-label" className="text-body text-ink">
        状態で絞り込む
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const pressed = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(option.value)}
              className={`${BASE} ${pressed ? SELECTED : UNSELECTED}`}
            >
              {option.label}（{option.count}）
            </button>
          );
        })}
      </div>
    </div>
  );
}
