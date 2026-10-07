"use client";

import { usePathname } from "@/i18n/navigation";
import { localePath } from "@/lib/paths";

export function CrmNav({ locale, links }: { locale: string; links: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav>
      {links.map((link) => {
        const active = link.href === "/admin" ? path === "/admin" : path === link.href || path.startsWith(`${link.href}/`);
        return (
          <a key={link.href} className={active ? "crm-link active" : "crm-link"} href={localePath(locale, link.href)}>
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
