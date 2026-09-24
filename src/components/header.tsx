"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const links = [
    ["/", "サービス"],
    ["/plans", "料金プラン"],
    ["/campaign", "キャンペーン"],
    ["/simulator", "料金シミュレーター"],
  ];
  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="LinkOne Mobile ホーム"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            L<span>↗</span>
          </span>
          <span>
            LinkOne<small>MOBILE</small>
          </span>
        </Link>
        <button
          className="menu-button"
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "閉じる ×" : "メニュー ☰"}
        </button>
        <nav
          id="main-nav"
          className={open ? "nav open" : "nav"}
          aria-label="メインナビゲーション"
        >
          {links.map(([href, text]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {text}
            </Link>
          ))}
          <Link
            className="button primary small"
            href="/apply"
            onClick={() => setOpen(false)}
          >
            お申し込み <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
