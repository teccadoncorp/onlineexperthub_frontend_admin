"use client";

import { useState } from "react";
import type { BoardOrder } from "@/lib/admin";
import { tx } from "@/lib/tx";
import { ProjectBoard } from "./board";

export function ProjectsView({
  locale,
  orders,
  catalogue,
}: {
  locale: string;
  orders: BoardOrder[];
  catalogue: React.ReactNode;
}) {
  const [tab, setTab] = useState<"orders" | "catalogue">("orders");
  return (
    <div className="loop-stack">
      <div className="loop-split-head">
        <div className="loop-tabs">
          <button type="button" className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>
            {tx(locale, "Orders", "অর্ডার")}
          </button>
          <button type="button" className={tab === "catalogue" ? "on" : ""} onClick={() => setTab("catalogue")}>
            {tx(locale, "Catalogue", "তালিকা")}
          </button>
        </div>
        <button
          type="button"
          className="loop-btn"
          onClick={() => {
            setTab("catalogue");
            requestAnimationFrame(() => document.getElementById("create")?.scrollIntoView({ behavior: "smooth" }));
          }}
        >
          {tx(locale, "Add new project", "নতুন প্রকল্প")}
        </button>
      </div>
      {tab === "orders" ? <ProjectBoard locale={locale} orders={orders} title={tx(locale, "Manage projects", "প্রকল্প")} /> : catalogue}
    </div>
  );
}
