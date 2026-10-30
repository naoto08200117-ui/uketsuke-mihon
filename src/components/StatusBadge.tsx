import type { Status } from "@/types/reservation";
import { STATUS_LABELS } from "@/lib/status";

// 状態の色（DESIGN.md の追記）。連絡済みは ink、accent は使わない
const COLOR: Record<Status, string> = {
  new: "border-new text-new",
  contacted: "border-ink text-ink",
  confirmed: "border-ok text-ok",
  done: "border-muted text-muted",
  canceled: "border-muted text-muted",
};

// 状態の札。色だけで分けず、必ず文字（新規など）を出す
export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-control border px-2 text-small whitespace-nowrap ${COLOR[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
