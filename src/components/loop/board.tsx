"use client";

import { useMemo, useState } from "react";
import type { BoardOrder } from "@/lib/admin";
import { formatInr } from "@/lib/money";
import { hue, initials, when } from "@/lib/people";
import { statusLabel, tx } from "@/lib/tx";

const FILTERS = [
  { id: "priority", en: "Priority", bn: "জরুরি" },
  { id: "active", en: "Active", bn: "সক্রিয়" },
  { id: "completed", en: "Completed", bn: "শেষ" },
  { id: "canceled", en: "Canceled", bn: "বাতিল" },
  { id: "recommended", en: "Recommended", bn: "প্রস্তাবিত" },
] as const;

function bucket(status: string) {
  if (status === "DISPUTED" || status === "AWAITING_PAYMENT" || status === "DOCUMENTS_QUERIED") return "priority";
  if (status === "CLOSED") return "completed";
  if (status === "DECLINED" || status === "CANCELLED") return "canceled";
  if (status === "DRAFT" || status === "SUBMITTED") return "recommended";
  return "active";
}

function tone(status: string) {
  if (status === "DRAFT" || status === "SUBMITTED") return "draft";
  if (status === "ACK_UPLOADED" || status === "DISPUTED") return "review";
  if (status === "CLOSED") return "done";
  if (status === "DECLINED" || status === "CANCELLED") return "canceled";
  return "progress";
}

export function ProjectBoard({ locale, orders, title }: { locale: string; orders: BoardOrder[]; title: string }) {
  const first = FILTERS.find((item) => orders.some((order) => bucket(order.status) === item.id))?.id || "priority";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>(first);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const counts = useMemo(() => {
    const tally = { priority: 0, active: 0, completed: 0, canceled: 0, recommended: 0 };
    for (const order of orders) tally[bucket(order.status)] += 1;
    return tally;
  }, [orders]);
  const needle = query.trim().toLowerCase();
  const rows = orders.filter((order) => {
    if (bucket(order.status) !== filter) return false;
    if (!needle) return true;
    const task = locale === "en" ? order.task : order.taskBn;
    return `${order.client} ${order.handle} ${task} ${order.note}`.toLowerCase().includes(needle);
  });

  return (
    <section className="loop-card loop-board">
      <header className="loop-board-head">
        <h2>{title}</h2>
        <label className="loop-search">
          <span aria-hidden>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(locale, "Search", "খুঁজুন")} />
        </label>
      </header>
      <div className="loop-tabs" role="tablist">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
            {tx(locale, item.en, item.bn)}
            <b>{counts[item.id]}</b>
          </button>
        ))}
      </div>
      <div className="loop-table" role="table">
        <div className="loop-thead" role="row">
          <span>{tx(locale, "Client", "ক্লায়েন্ট")}</span>
          <span>{tx(locale, "Task", "কাজ")}</span>
          <span>{tx(locale, "Note", "নোট")}</span>
          <span>{tx(locale, "Opened", "খোলা")}</span>
          <span>{tx(locale, "Price", "মূল্য")}</span>
          <span>{tx(locale, "Status", "অবস্থা")}</span>
        </div>
        {rows.length === 0 ? <p className="loop-empty">{tx(locale, "Nothing in this list.", "এই তালিকায় কিছু নেই।")}</p> : null}
        {rows.map((order) => {
          const task = locale === "en" ? order.task : order.taskBn;
          const chip = tone(order.status);
          return (
            <button
              key={order.id}
              type="button"
              className={selected === order.id ? "loop-row on" : "loop-row"}
              onClick={() => setSelected(order.id)}
            >
              <span className="loop-who">
                <i style={{ background: hue(order.client) }}>{initials(order.client)}</i>
                <span>
                  <strong>{order.client}</strong>
                  <em>{order.handle}</em>
                </span>
              </span>
              <span>
                <strong>{task}</strong>
                <em>{order.lane === "PORTAL" ? tx(locale, "Portal filing", "পোর্টাল ফাইলিং") : tx(locale, "Professional work", "পেশাদার কাজ")}</em>
              </span>
              <span className="loop-note" title={order.note || tx(locale, "No expert yet", "এখনও বিশেষজ্ঞ নেই")}>
                {order.note ? "▣" : "—"}
              </span>
              <span>{when(order.openedAt)}</span>
              <span className="loop-price">{formatInr(order.pricePaise)}</span>
              <span className={`loop-status ${chip}`} title={statusLabel(locale, order.status)}>
                {chip === "draft"
                  ? tx(locale, "Draft", "খসড়া")
                  : chip === "review"
                    ? tx(locale, "On review", "পর্যালোচনা")
                    : chip === "done"
                      ? tx(locale, "Done", "শেষ")
                      : chip === "canceled"
                        ? tx(locale, "Canceled", "বাতিল")
                        : tx(locale, "In progress", "চলছে")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
