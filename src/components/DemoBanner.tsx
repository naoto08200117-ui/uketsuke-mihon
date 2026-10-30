// D-01：全画面の一番上に常に出す（閉じるボタンは付けない）
export default function DemoBanner() {
  return (
    <p className="border-b border-line px-4 py-2 text-small text-ink lg:pl-40">
      架空のデモです。入力はこのブラウザの中だけに残り、どこにも送られません。
    </p>
  );
}
