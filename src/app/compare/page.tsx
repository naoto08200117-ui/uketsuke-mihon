import CompareView from "@/components/compare/CompareView";
import DiffTable from "@/components/compare/DiffTable";

// ④前後の比較（F17。応募に載せる入口）。localStorage を使わないので、書き出しの時にすべて描ける
// 並び：C-01 → C-02 → 左右（C-03・画像／C-04・一覧）→ C-08 → C-05 → C-06 → D-02
export default function ComparePage() {
  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <h1 className="border-b-4 border-accent pb-2 text-title font-bold text-ink">スプレッドシートの時と、アプリの今</h1>
      <p className="text-body text-ink">同じ架空の10件を並べています。</p>
      <CompareView />
      <p className="text-body text-ink">
        試すには：上の『申込フォーム』で申し込み、『管理一覧』で状態を進めてみてください。
      </p>
      <DiffTable />
      <p className="text-body text-ink">
        本番では、ログインを付けて、御社のシートやデータベースにつなぎます。開催日・お名前・連絡先はすべて架空です。
      </p>
    </div>
  );
}
