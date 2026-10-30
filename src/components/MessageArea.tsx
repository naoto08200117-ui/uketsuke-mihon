// メッセージを出す場所。読み上げのため、空のときも role="status" の要素を置いておく
// messages：エラーや注意（S-01〜S-04 など）＝ danger／notices：成功のお知らせ（A-09・A-11 など）＝ ink
export default function MessageArea({
  messages,
  notices = [],
}: {
  messages: readonly string[];
  notices?: readonly string[];
}) {
  return (
    <div role="status" className="flex flex-col gap-2">
      {messages.map((message) => (
        <p key={message} className="text-body text-danger">
          {message}
        </p>
      ))}
      {notices.map((notice) => (
        <p key={notice} className="text-body text-ink">
          {notice}
        </p>
      ))}
    </div>
  );
}
