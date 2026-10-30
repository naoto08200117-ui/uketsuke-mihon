import { SEARCH_MAX } from "@/lib/limits";
import { controlClass } from "@/components/form/Field";

// F9：名前で探す（入力のたびに絞る。前後の空白を除くのは一覧の側で行う）
export default function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex max-w-xl flex-col gap-1">
      <label htmlFor="admin-search" className="text-body text-ink">
        名前で探す
      </label>
      <input
        id="admin-search"
        type="search"
        value={value}
        maxLength={SEARCH_MAX}
        placeholder="例：青木"
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      />
    </div>
  );
}
