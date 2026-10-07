import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { formatInr } from "@/lib/money";
import { tx } from "@/lib/tx";
import { markPayoutPaid, runPayoutBatch } from "@/server/admin";

export default async function PayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const report = await apiGet<{
    waiting: number;
    payouts: { id: string; amountPaise: number; status: string; expert: { displayName: string }; orders: { id: string }[] }[];
  }>(adminPath("/payouts"));
  const payouts = report?.payouts || [];
  return (
    <section className="loop-card" style={{ marginTop: 0 }}>
      <h2>{tx(locale, "Weekly payout report", "সাপ্তাহিক পেআউট")}</h2>
      <p className="loop-sub">{tx(locale, "Orders ready", "প্রস্তুত অর্ডার")}: {report?.waiting || 0}</p>
      <form action={runPayoutBatch}>
        <input type="hidden" name="locale" value={locale} />
        <button className="loop-btn" type="submit">{tx(locale, "Create this week's batch", "এই সপ্তাহের ব্যাচ")}</button>
      </form>
      <div className="loop-table" style={{ marginTop: 14 }}>
        {payouts.map((payout) => (
          <div key={payout.id} className="loop-row" style={{ cursor: "default" }}>
            <span><strong>{payout.expert.displayName}</strong><em>{payout.orders.length}</em></span>
            <span className="loop-price">{formatInr(payout.amountPaise)}</span>
            <span className={payout.status === "PAID" ? "loop-status done" : "loop-status progress"}>{payout.status}</span>
            <span>
              {payout.status === "PENDING" ? (
                <form action={markPayoutPaid}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payoutId" value={payout.id} />
                  <button className="loop-btn" type="submit">{tx(locale, "Mark bank transfer paid", "ব্যাংকে দিয়েছি")}</button>
                </form>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
