"use client";

import { usePathname } from "@/i18n/navigation";
import { localePath } from "@/lib/paths";

const ANALYTICS = ["/admin/analytics", "/admin/payouts", "/admin/coverage"];

export function LoopNav({ locale, links }: { locale: string; links: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="loop-nav" aria-label="Admin">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? path === "/admin"
            : link.href === "/admin/analytics"
              ? ANALYTICS.some((href) => path === href || path.startsWith(`${href}/`))
              : path === link.href || path.startsWith(`${link.href}/`);
        return (
          <a key={link.href} className={active ? "loop-pill on" : "loop-pill"} href={localePath(locale, link.href)}>
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
