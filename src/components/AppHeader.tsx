import Link from "next/link";

const links = [
  { href: "/", label: "申込フォーム" },
  { href: "/admin/", label: "管理一覧" },
  { href: "/compare/", label: "前後の比較" },
] as const;

// H-01（アプリ名）と H-02（3つのリンク）
export default function AppHeader() {
  return (
    <header className="border-b border-line px-4 py-3 lg:pl-40">
      <p className="text-body text-ink">体験レッスン受付（見本）</p>
      <nav aria-label="画面の切り替え">
        <ul className="flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-6 min-w-6 items-center text-body text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
