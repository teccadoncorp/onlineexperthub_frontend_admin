"use client";

import { useState } from "react";
import { NamedSelect } from "@/components/fields";
import { AddShopForm } from "@/components/loop/add-shop-form";
import { formatInr } from "@/lib/money";
import { hue, initials } from "@/lib/people";
import { tx } from "@/lib/tx";
import { setExpertStatus } from "@/server/admin";

type ShopCard = {
  id: string;
  name: string;
  district: string;
  pincode: string;
  pilot: boolean;
  marginPaise: number;
  owner: { name: string; phone: string };
};

type ExpertCard = {
  id: string;
  displayName: string;
  district: string;
  status: string;
  credentialType: string;
  credentialNumber: string;
  user: { phone: string };
  pincodes: { pincode: string }[];
};

type PinOption = { pincode: string; district: string; area: string };

export function ClientsView({
  locale,
  shops,
  experts,
  pins,
}: {
  locale: string;
  shops: ShopCard[];
  experts: ExpertCard[];
  pins: PinOption[];
}) {
  const [tab, setTab] = useState<"shops" | "experts">("shops");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const needle = query.trim().toLowerCase();
  const shopRows = shops.filter((shop) => `${shop.name} ${shop.district} ${shop.owner.name}`.toLowerCase().includes(needle));
  const expertRows = experts.filter((expert) => `${expert.displayName} ${expert.district} ${expert.user.phone}`.toLowerCase().includes(needle));

  return (
    <section className="loop-card">
      <header className="loop-board-head">
        <h2>{tx(locale, "Manage clients", "ক্লায়েন্ট")}</h2>
        <div className="loop-user-tools">
          <label className="loop-search">
            <span aria-hidden>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(locale, "Search", "খুঁজুন")} />
          </label>
          {tab === "shops" ? (
            <button className="loop-btn" type="button" onClick={() => setAdding((value) => !value)}>
              {tx(locale, "Add shop", "দোকান যোগ")}
            </button>
          ) : null}
        </div>
      </header>
      {tab === "shops" && adding ? <AddShopForm locale={locale} pins={pins} onClose={() => setAdding(false)} /> : null}
      <div className="loop-tabs">
        <button type="button" className={tab === "shops" ? "on" : ""} onClick={() => setTab("shops")}>
          {tx(locale, "Shops", "দোকান")}
          <b>{shops.length}</b>
        </button>
        <button type="button" className={tab === "experts" ? "on" : ""} onClick={() => setTab("experts")}>
          {tx(locale, "Experts", "বিশেষজ্ঞ")}
          <b>{experts.length}</b>
        </button>
      </div>
      <div className="loop-people">
        {tab === "shops"
          ? shopRows.map((shop) => (
              <article key={shop.id} className={open === shop.id ? "loop-person-card on" : "loop-person-card"}>
                <button type="button" className="loop-person-hit" onClick={() => setOpen(open === shop.id ? null : shop.id)}>
                  <i style={{ background: hue(shop.name) }}>{initials(shop.name)}</i>
                  <strong>{shop.name}</strong>
                  <em>
                    {shop.owner.name} · {shop.district}
                  </em>
                </button>
                <dl>
                  <div>
                    <dt>{tx(locale, "From", "থেকে")}</dt>
                    <dd>{shop.district}</dd>
                  </div>
                  <div>
                    <dt>{tx(locale, "PIN", "পিন")}</dt>
                    <dd>{shop.pincode}</dd>
                  </div>
                  <div>
                    <dt>{tx(locale, "Margin", "মার্জিন")}</dt>
                    <dd>{formatInr(shop.marginPaise)}</dd>
                  </div>
                </dl>
                {open === shop.id ? (
                  <div className="loop-float">
                    <strong>{shop.owner.name}</strong>
                    <span>{tx(locale, "Login", "লগইন")} {shop.owner.phone}</span>
                    <em>{shop.pilot ? tx(locale, "Pilot shop", "পাইলট দোকান") : tx(locale, "Live shop", "লাইভ দোকান")}</em>
                  </div>
                ) : null}
              </article>
            ))
          : expertRows.map((expert) => (
              <article key={expert.id} className="loop-person-card">
                <div className="loop-person-hit">
                  <i style={{ background: hue(expert.displayName) }}>{initials(expert.displayName)}</i>
                  <strong>{expert.displayName}</strong>
                  <em>
                    {expert.credentialType} · {expert.district}
                  </em>
                </div>
                <dl>
                  <div>
                    <dt>{tx(locale, "Status", "অবস্থা")}</dt>
                    <dd>{expert.status}</dd>
                  </div>
                  <div>
                    <dt>{tx(locale, "PIN", "পিন")}</dt>
                    <dd>{expert.pincodes.map((pin) => pin.pincode).join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt>{tx(locale, "Phone", "ফোন")}</dt>
                    <dd>{expert.user.phone}</dd>
                  </div>
                </dl>
                <form action={setExpertStatus} className="loop-inline">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="expertId" value={expert.id} />
                  <NamedSelect
                    name="status"
                    defaultValue={expert.status}
                    options={["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"].map((status) => ({ value: status, label: status }))}
                  />
                  <button type="submit">{tx(locale, "Update", "আপডেট")}</button>
                </form>
              </article>
            ))}
      </div>
      {(tab === "shops" ? shopRows : expertRows).length === 0 ? <p className="loop-empty">{tx(locale, "No matches.", "কিছু মেলেনি।")}</p> : null}
    </section>
  );
}
