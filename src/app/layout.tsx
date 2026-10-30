import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import DemoBanner from "@/components/DemoBanner";
import "./globals.css";

// 書体は globals.css の --font-sans（OS に入っている書体）を使うため、next/font は読み込まない
export const metadata: Metadata = {
  title: "体験レッスン受付（見本）",
};

// CSP の meta は、書き出した HTML で最初の <script> より後ろに入り効かないため入れない
// （docs/decisions/0001_CSPを入れなかった理由.md）。referrer の meta だけ残す
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-surface text-body text-ink">
        <DemoBanner />
        <AppHeader />
        <main className="px-4 pt-6 pb-12 lg:pl-40">{children}</main>
      </body>
    </html>
  );
}
