"use client";

import { useEffect, useRef, useState } from "react";
import { localePath } from "@/lib/paths";
import { tx } from "@/lib/tx";

export function StudioMenu({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const links = [
    { href: "/admin/news", label: tx(locale, "News", "খবর") },
    { href: "/admin/tutorials", label: tx(locale, "Tutorials", "টিউটোরিয়াল") },
    { href: "/admin/payouts", label: tx(locale, "Payouts", "পেআউট") },
    { href: "/admin/coverage", label: tx(locale, "Coverage", "কভারেজ") },
  ];
  return (
    <div className="loop-menu" ref={root}>
      <button type="button" className="loop-plus" aria-expanded={open} aria-label={tx(locale, "More", "আরও")} onClick={() => setOpen((value) => !value)}>
        +
      </button>
      {open ? (
        <div className="loop-pop" role="menu">
          {links.map((link) => (
            <a key={link.href} role="menuitem" href={localePath(locale, link.href)}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
