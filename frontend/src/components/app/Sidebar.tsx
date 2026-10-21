"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useT } from "@/components/i18n/I18nProvider";

import { NavGlyph } from "./NavIcons";
import type { NavChild, NavItem } from "./navigation";

/** Path of a menu link without its #section or ?query. */
const pathOf = (href: string) => href.split(/[?#]/)[0] ?? href;

function isActive(pathname: string, href: string): boolean {
  const path = pathOf(href);
  return path === "/dashboard" || path === "/admin" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * The menu, as in the old app: top-level links with an icon, and groups that
 * fold open (the group of the current page starts open).
 */
export function SideNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  const groupIsActive = (children: NavChild[]) => children.some((child) => !child.external && isActive(pathname, child.href));
  // The sub-link whose path matches the current page most closely (e.g. "Spot Report" over "Employee").
  const activeChild = items
    .flatMap((item) => item.children ?? [])
    .filter((child) => !child.external && isActive(pathname, child.href))
    .sort((a, b) => pathOf(b.href).length - pathOf(a.href).length)[0]?.href;
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.filter((item) => item.children).map((item) => [item.label, groupIsActive(item.children ?? [])])),
  );

  return (
    <nav aria-label={t("Main menu")} className="pz-nav">
      {items.map((item) => {
        if (!item.children) {
          const active = item.href ? isActive(pathname, item.href) : false;
          return (
            <Link key={item.label} href={item.href ?? "#"} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "nav-link-active" : ""}`}>
              <NavGlyph name={item.icon} />
              <span className="flex-1">{t(item.label)}</span>
              {item.alert && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" title={t("Setup incomplete")} aria-label={t("Setup incomplete")} />}
            </Link>
          );
        }

        const groupId = `nav-group-${item.label.toLowerCase()}`;
        const expanded = open[item.label] ?? false;
        return (
          <div key={item.label}>
            <button
              type="button"
              className="nav-link"
              aria-expanded={expanded}
              aria-controls={groupId}
              onClick={() => setOpen((state) => ({ ...state, [item.label]: !expanded }))}
            >
              <NavGlyph name={item.icon} />
              <span className="flex-1 text-start">{t(item.label)}</span>
              <span className="nav-chevron" aria-hidden="true" />
            </button>
            <div id={groupId} hidden={!expanded} className="nav-group">
              {item.children.map((child) =>
                child.external ? (
                  <a key={child.href} href={child.href} target="_blank" rel="noopener noreferrer" className="nav-sublink">
                    {t(child.label)}
                  </a>
                ) : (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    aria-current={child.href === activeChild ? "page" : undefined}
                    className={`nav-sublink ${child.href === activeChild ? "nav-sublink-active" : ""}`}
                  >
                    {t(child.label)}
                  </Link>
                ),
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
