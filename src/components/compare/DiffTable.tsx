// C-05 の回数と C-06 の日付。docs/decisions/0002_比較の数え方.md に記録した値だけを書く。
// 記録がないものは null にし、「（{n}回の操作）」の部分ごと出さない（要件定義書11章）
const MEASURED = {
  colorChange: null as number | null,
  filterNew: null as number | null,
  date: null as string | null,
};

function withCount(text: string, count: number | null): string {
  return count === null ? text : `${text}（${count}回の操作）`;
}

const ROWS: readonly (readonly [string, string, string])[] = [
  ["状態の分け方", "セルの色（色の意味は別に覚える）", "文字の札（新規・連絡済み・確定・完了・キャンセル）"],
  ["状態を1つ進める", withCount("セルを選び、塗りつぶしの色を選ぶ", MEASURED.colorChange), "ボタン1回"],
  ["定員", "自分で足し算する（12月5日が10人）", "開催日ごとの残り席を表示。満席の日は選べない"],
  ["同じ人の申込", "清水さんが2行", "同じ連絡先・同じ日の申込はフォームで受け付けない"],
  ["新規だけを見る", withCount("フィルタを設定する", MEASURED.filterNew), "「新規」を押す（1回）"],
  ["スマホで見る", "横に長い表を左右に動かして見る", "1件ずつ縦に並ぶ"],
];

const cell = "border-b border-line py-3 pr-4 text-left align-top font-normal wrap-anywhere";

// C-05（違いの表）と C-06（数字の注）。字は折り返すので、375px でも横に動かさずに読める
export default function DiffTable() {
  const hasCount = MEASURED.colorChange !== null || MEASURED.filterNew !== null;
  return (
    <section aria-label="違いの表" className="flex flex-col gap-3">
      <table className="w-full table-fixed border-t border-line text-body text-ink">
        <thead>
          <tr>
            <th scope="col" className={cell}>観点</th>
            <th scope="col" className={cell}>スプレッドシートの時</th>
            <th scope="col" className={cell}>アプリ</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([point, before, after]) => (
            <tr key={point}>
              <th scope="row" className={cell}>{point}</th>
              <td className={cell}>{before}</td>
              <td className={cell}>{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasCount && MEASURED.date !== null ? (
        <p className="text-small text-muted">
          操作の回数は、作った人が Chrome で数えたものです（{MEASURED.date}）。かかる時間は測っていないため、書いていません。
        </p>
      ) : null}
    </section>
  );
}
