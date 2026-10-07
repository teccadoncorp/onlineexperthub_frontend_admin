import { AddMoneyForm } from "@/components/loop/add-money-form";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { formatInrExact } from "@/lib/money";
import { performedBy, tx } from "@/lib/tx";

type ShopBalance = { id: string; name: string; district: string; balancePaise: number };
type LedgerRow = {
  id: string;
  shopName: string;
  amountPaise: number;
  balanceAfterPaise: number;
  note: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
};

function when(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function LedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const report = await apiGet<{ shops: ShopBalance[]; entries: LedgerRow[] }>(adminPath("/ledger"));
  const shops = report?.shops || [];
  const entries = report?.entries || [];
  const problem =
    error === "amount"
      ? tx(locale, "Enter an amount from ₹1 to ₹10,00,000, with at most two decimals.", "₹১ থেকে ₹১০,০০,০০০ পর্যন্ত লিখুন, দশমিক সর্বোচ্চ দুই ঘর।")
      : error === "note"
        ? tx(locale, "Add a reason between 3 and 200 characters.", "৩ থেকে ২০০ অক্ষরের একটি কারণ লিখুন।")
        : error === "shop"
          ? tx(locale, "That shop could not be credited.", "এই দোকানে টাকা জমা হয়নি।")
          : error === "mismatch"
            ? tx(locale, "This shop's balance does not match its ledger, so no money was added.", "এই দোকানের ব্যালেন্স খতিয়ানের সাথে মেলেনি, তাই টাকা যোগ হয়নি।")
            : error
              ? tx(locale, "The credit was not saved. Try again.", "জমা সেভ হয়নি। আবার চেষ্টা করুন।")
              : null;
  return (
    <div className="ledger-grid">
      <section className="loop-card" style={{ marginTop: 0 }}>
        <h2>{tx(locale, "Add money", "টাকা যোগ করুন")}</h2>
        <p className="loop-sub">
          {tx(locale, "Each credit is permanent. A repeated submit of the same form adds the money once.", "প্রতিটি জমা স্থায়ী। একই ফর্ম বারবার পাঠালে টাকা একবারই যোগ হয়।")}
        </p>
        {problem ? <p className="loop-alert">{problem}</p> : null}
        {shops.length ? <AddMoneyForm locale={locale} shops={shops} /> : <p className="loop-sub">{tx(locale, "No retail shops yet.", "এখনও কোনো রিটেইল দোকান নেই।")}</p>}
      </section>
      <section className="loop-card" style={{ marginTop: 0 }}>
        <h2>{tx(locale, "Shop balances", "দোকানের ব্যালেন্স")}</h2>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>{tx(locale, "Shop", "দোকান")}</th>
              <th>{tx(locale, "Balance", "ব্যালেন্স")}</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td>
                  <strong>{shop.name}</strong>
                  <div className="loop-sub">{shop.district}</div>
                </td>
                <td>{formatInrExact(shop.balancePaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 style={{ marginTop: 22 }}>{tx(locale, "Recent credits", "সাম্প্রতিক জমা")}</h2>
        {entries.length === 0 ? (
          <p className="loop-sub">{tx(locale, "No credits yet.", "এখনও কোনো জমা নেই।")}</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>{tx(locale, "When", "সময়")}</th>
                <th>{tx(locale, "Performed by", "কে করেছে")}</th>
                <th>{tx(locale, "Shop", "দোকান")}</th>
                <th>{tx(locale, "Amount", "পরিমাণ")}</th>
                <th>{tx(locale, "Balance", "ব্যালেন্স")}</th>
                <th>{tx(locale, "Reason", "কারণ")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id}>
                  <td>{when(row.createdAt, locale)}</td>
                  <td>{performedBy(locale, row.actorName, row.actorRole)}</td>
                  <td>{row.shopName}</td>
                  <td>{formatInrExact(row.amountPaise)}</td>
                  <td>{formatInrExact(row.balanceAfterPaise)}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
