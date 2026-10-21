"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { useT } from "@/components/i18n/I18nProvider";

import type { NavItem } from "./navigation";
import { SideNav } from "./Sidebar";

/**
 * The side panel, the top bar and the page between them. The button in the bar
 * folds the panel away on a wide screen and slides it in over the page on a narrow one.
 */
export function ShellFrame({ items, appName, bar, footer, children }: { items: NavItem[]; appName: string; bar: ReactNode; footer: ReactNode; children: ReactNode }) {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  function toggle() {
    if (window.matchMedia("(min-width: 992px)").matches) {
      setCollapsed((value) => !value);
    } else {
      setOpen((value) => !value);
    }
  }

  return (
    <div className="pz-wrap" data-collapsed={collapsed} data-open={open}>
      <aside id="sidebar" className="pz-sidebar print:hidden">
        <Link href="/dashboard" className="pz-brand" aria-label={appName} onClick={() => setOpen(false)}>
          <Logo alt={appName} width={108} height={36} priority />
        </Link>
        <SideNav items={items} onNavigate={() => setOpen(false)} />
      </aside>
      <div className="pz-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="pz-main">
        <header className="pz-topbar print:hidden">
          <button type="button" className="pz-toggle" onClick={toggle} aria-controls="sidebar" aria-label={t("Menu")} />
          {bar}
        </header>
        <main className="min-w-0">{children}</main>
        <footer className="pz-footer print:hidden">{footer}</footer>
      </div>
    </div>
  );
}
