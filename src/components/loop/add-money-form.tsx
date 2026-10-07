"use client";

import { useEffect, useState } from "react";
import { InputBox } from "@/components/ant";
import { tx } from "@/lib/tx";
import { creditShop } from "@/server/admin";

export function AddMoneyForm({
  locale,
  shops,
}: {
  locale: string;
  shops: { id: string; name: string; district: string }[];
}) {
  const [key, setKey] = useState("");
  useEffect(() => {
    setKey(crypto.randomUUID());
  }, []);
  return (
    <form action={creditShop} className="loop-form">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="idempotencyKey" value={key} />
      <label>
        {tx(locale, "Retail shop", "রিটেইল দোকান")}
        <select name="shopId" required defaultValue={shops[0]?.id ?? ""}>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name} · {shop.district}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tx(locale, "Amount (₹)", "পরিমাণ (₹)")}
        <InputBox name="amountRupees" inputMode="decimal" autoComplete="off" required placeholder="500.00" />
      </label>
      <label>
        {tx(locale, "Reason", "কারণ")}
        <InputBox name="note" required maxLength={200} placeholder={tx(locale, "Cash collected from the shop", "দোকান থেকে নগদ জমা")} />
      </label>
      <button className="loop-btn" type="submit" disabled={!key}>
        {tx(locale, "Add money", "টাকা যোগ করুন")}
      </button>
    </form>
  );
}
