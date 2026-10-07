"use client";

import { useState } from "react";
import { localePath } from "@/lib/paths";
import { tx } from "@/lib/tx";
import { runRetention } from "@/server/admin";

export function Assistant({
  locale,
  name,
  pendingExperts,
  openDisputes,
  waitingPayouts,
}: {
  locale: string;
  name: string;
  pendingExperts: number;
  openDisputes: number;
  waitingPayouts: number;
}) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const tiles = [
    { href: "/admin/experts", tone: "mint", title: tx(locale, "Verify experts", "বিশেষজ্ঞ যাচাই"), hint: tx(locale, "Pending profiles", "অপেক্ষমাণ প্রোফাইল") },
    { href: "/admin/disputes", tone: "rose", title: tx(locale, "Open disputes", "অভিযোগ"), hint: tx(locale, "Refund or reject", "ফেরত বা বাতিল") },
    { href: "/admin/services", tone: "amber", title: tx(locale, "Catalogue", "তালিকা"), hint: tx(locale, "Services and fields", "পরিষেবা ও ফিল্ড") },
    { href: "/admin/payouts", tone: "pink", title: tx(locale, "Payouts", "পেআউট"), hint: tx(locale, "Weekly bank batch", "সাপ্তাহিক ব্যাচ") },
  ];
  const needle = query.trim().toLowerCase();
  const shown = needle ? tiles.filter((tile) => `${tile.title} ${tile.hint}`.toLowerCase().includes(needle)) : tiles;

  function ask(event: React.FormEvent) {
    event.preventDefault();
    const text = query.toLowerCase();
    if (text.includes("payout") || text.includes("পে")) {
      setAnswer(tx(locale, `${waitingPayouts} paid orders are waiting for a batch.`, `${waitingPayouts}টি অর্ডার ব্যাচের অপেক্ষায়।`));
      return;
    }
    if (text.includes("expert") || text.includes("বিশেষ")) {
      setAnswer(tx(locale, `${pendingExperts} experts are waiting for verification.`, `${pendingExperts} জন বিশেষজ্ঞ যাচাইয়ের অপেক্ষায়।`));
      return;
    }
    if (text.includes("dispute") || text.includes("অভিযোগ")) {
      setAnswer(tx(locale, `${openDisputes} disputes are still open.`, `${openDisputes}টি অভিযোগ খোলা আছে।`));
      return;
    }
    setAnswer(tx(locale, "Ask about experts, disputes, or payouts.", "বিশেষজ্ঞ, অভিযোগ, বা পেআউট নিয়ে জিজ্ঞাসা করুন।"));
  }

  return (
    <section className="loop-assist">
      <p className="loop-hi">
        {tx(locale, "Hi", "হ্যালো")} {name.split(" ")[0]}
      </p>
      <h2>{tx(locale, "How can I help you?", "কীভাবে সাহায্য করব?")}</h2>
      <div className="loop-tiles">
        {shown.map((tile) => (
          <a key={tile.href} className={`loop-tile ${tile.tone}`} href={localePath(locale, tile.href)}>
            <i />
            <strong>{tile.title}</strong>
            <span>{tile.hint}</span>
          </a>
        ))}
      </div>
      {answer ? <p className="loop-answer">{answer}</p> : null}
      <form className="loop-composer" onSubmit={ask}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(locale, "Ask something...", "কিছু জিজ্ঞাসা করুন...")} />
        <button type="submit" aria-label={tx(locale, "Ask", "জিজ্ঞাসা")}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M4 12h16M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>
      <form action={runRetention} className="loop-retain">
        <input type="hidden" name="locale" value={locale} />
        <button type="submit">{tx(locale, "Clear expired files", "মেয়াদোত্তীর্ণ ফাইল মুছুন")}</button>
      </form>
    </section>
  );
}
