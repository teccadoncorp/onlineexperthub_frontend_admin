"use client";

import { useState } from "react";
import { hue, initials, when } from "@/lib/people";
import { tx } from "@/lib/tx";
import { resolveDispute } from "@/server/admin";

export type DisputeRow = {
  id: string;
  reason: string;
  status: string;
  createdAt: string | Date;
  order: { id: string; service: { nameEn: string; nameBn: string }; shop: { name: string } };
};

export function InboxView({ locale, disputes }: { locale: string; disputes: DisputeRow[] }) {
  const [current, setCurrent] = useState(disputes[0]?.id || "");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const rows = disputes.filter((row) => `${row.order.shop.name} ${row.reason} ${row.status}`.toLowerCase().includes(needle));
  const active = rows.find((row) => row.id === current) || rows[0];
  const service = active ? (locale === "en" ? active.order.service.nameEn : active.order.service.nameBn) : "";

  return (
    <div className="loop-inbox">
      <section className="loop-card loop-thread">
        {active ? (
          <>
            <header className="loop-thread-top">
              <i style={{ background: hue(active.order.shop.name) }}>{initials(active.order.shop.name)}</i>
              <div>
                <strong>{active.order.shop.name}</strong>
                <span>
                  {service} · {when(active.createdAt)}
                </span>
              </div>
              <em className={active.status === "OPEN" ? "loop-status review" : "loop-status done"}>{active.status}</em>
            </header>
            <div className="loop-bubbles">
              <p className="in">{active.reason}</p>
              <p className="out">
                {active.status === "OPEN"
                  ? tx(locale, "This dispute is still open. Refund the shop or reject the claim.", "অভিযোগটি খোলা। দোকানকে ফেরত দিন, অথবা দাবি বাতিল করুন।")
                  : tx(locale, `Marked ${active.status}.`, `অবস্থা ${active.status}।`)}
              </p>
            </div>
            {active.status === "OPEN" ? (
              <form action={resolveDispute} className="loop-actions">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="disputeId" value={active.id} />
                <button type="submit" name="status" value="REFUNDED">
                  {tx(locale, "Refund", "ফেরত")}
                </button>
                <button type="submit" name="status" value="REJECTED" className="ghost">
                  {tx(locale, "Reject", "বাতিল")}
                </button>
              </form>
            ) : null}
            <p className="loop-fine">{tx(locale, "Check the order before you refund. A refund cancels the order.", "ফেরতের আগে অর্ডার দেখে নিন। ফেরত দিলে অর্ডার বাতিল হয়।")}</p>
          </>
        ) : (
          <p className="loop-empty">{tx(locale, "No disputes.", "কোনো অভিযোগ নেই।")}</p>
        )}
      </section>
      <aside className="loop-card loop-msglist">
        <header className="loop-board-head">
          <h2>{tx(locale, "All messages", "সব বার্তা")}</h2>
          <label className="loop-search">
            <span aria-hidden>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(locale, "Search", "খুঁজুন")} />
          </label>
        </header>
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <button type="button" className={active?.id === row.id ? "on" : ""} onClick={() => setCurrent(row.id)}>
                <i style={{ background: hue(row.order.shop.name) }}>{initials(row.order.shop.name)}</i>
                <span>
                  <strong>{row.order.shop.name}</strong>
                  <em>{row.reason}</em>
                </span>
                <time>{when(row.createdAt)}</time>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
