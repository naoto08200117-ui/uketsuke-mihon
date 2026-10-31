import Image from "next/image";
import sheetBefore from "@/assets/compare/sheet-before.png";
import sheetBeforeSp from "@/assets/compare/sheet-before-sp.png";
import CompareList from "@/components/compare/CompareList";

// C-07（画像の代わりの文）
const SHEET_ALT =
  "スプレッドシートの画面写真。11行のうち、清水さんが2行、12月5日の行が10人分あり、状態がセルの色で塗り分けられている。";

const imageClass = "h-auto w-full border border-line";

// F17：左にスプレッドシートの画面写真、右にアプリの一覧（PC は左右、768px 未満は上下）
export default function CompareView() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <section aria-labelledby="compare-before-heading" className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 id="compare-before-heading" className="text-body font-bold text-ink">
          スプレッドシートの時（画面写真）
        </h2>
        <ul className="flex flex-col gap-1 text-body text-ink">
          <li>①状態をセルの色で分けている（色の意味は人が覚えている）</li>
          <li>②同じ人が2行ある（清水さん）</li>
          <li>③12月5日が10人で、定員の8人を超えている</li>
        </ul>
        {/* 幅で出し分けるのは CSS だけ（JS で幅を見ると、書き出しの HTML とずれて Hydration エラーになる）。
            375px では全体の写真の字が読めないため、問題の行（12/05 の3行〜清水さんの2行）だけを切り抜いた写真を出す */}
        <Image src={sheetBeforeSp} alt={SHEET_ALT} unoptimized className={`${imageClass} md:hidden`} />
        <Image src={sheetBefore} alt={SHEET_ALT} unoptimized className={`${imageClass} hidden md:block`} />
      </section>
      <section aria-labelledby="compare-after-heading" className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 id="compare-after-heading" className="text-body font-bold text-ink">
          アプリの一覧（同じ10件）
        </h2>
        <CompareList />
      </section>
    </div>
  );
}
