import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import "./globals.css";
import "./design.css";

export const metadata: Metadata = {
  title: {
    default: "LinkOne Mobile | つながる毎日を、もっと軽やかに。",
    template: "%s | LinkOne Mobile",
  },
  description:
    "あなたにちょうどいい通信を。LinkOne Mobileは、キャンペーンから申込・管理までを体験できる架空の通信サービスです。",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          本文へ移動
        </a>
        <div className="demo-strip">
          PORTFOLIO DEMO{" "}
          <span>架空のサービスです。実際の契約・請求は発生しません。</span>
        </div>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <div className="footer-top">
            <Link href="/" className="brand">
              LinkOne<span className="footer-mobile">MOBILE</span>
            </Link>
            <p>つながる毎日を、もっと軽やかに。</p>
            <nav aria-label="フッター">
              <Link href="/plans">料金プラン</Link>
              <Link href="/privacy">個人情報の取り扱い</Link>
              <Link href="/admin">社員向け管理画面 ↗</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© 2026 LinkOne Mobile · Portfolio project</span>
            <span>表示価格はすべて税込です。</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
