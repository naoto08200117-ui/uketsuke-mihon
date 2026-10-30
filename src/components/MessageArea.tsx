// メッセージ（S-01〜S-04 など）を出す場所。読み上げのため、空のときも role="status" の要素を置いておく
export default function MessageArea({ messages }: { messages: readonly string[] }) {
  return (
    <div role="status" className="flex flex-col gap-2">
      {messages.map((message) => (
        <p key={message} className="text-body text-danger">
          {message}
        </p>
      ))}
    </div>
  );
}
