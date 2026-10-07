import { apiGet } from "@/lib/api";
import { adminPath, EMPTY_DASHBOARD, type Dashboard } from "@/lib/admin";
import { formatInr } from "@/lib/money";
import { localePath } from "@/lib/paths";
import { statusLabel, tx } from "@/lib/tx";
import { markPayoutPaid, runPayoutBatch } from "@/server/admin";

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [board, report, coverage] = await Promise.all([
    apiGet<Dashboard>(adminPath("/dashboard")),
    apiGet<{ waiting: number; payouts: { id: string; amountPaise: number; status: string; expert: { displayName: string }; orders: { id: string }[] }[] }>(adminPath("/payouts")),
    apiGet<{ pins: { pincode: string; district: string; pilot: boolean }[]; shops: { district: string }[]; experts: { district: string; pincodes: string[] }[] }>(adminPath("/coverage")),
  ]);
  const data = board || EMPTY_DASHBOARD;
  const payouts = report?.payouts || [];
  const pins = coverage?.pins || [];
  const shops = coverage?.shops || [];
  const experts = coverage?.experts || [];
  const districts = [...new Set(pins.map((pin) => pin.district))].sort().map((district) => {
    const districtPins = pins.filter((pin) => pin.district === district);
    return {
      district,
      shops: shops.filter((shop) => shop.district === district).length,
      experts: experts.filter((expert) => expert.district === district || expert.pincodes.some((pin) => districtPins.some((row) => row.pincode === pin))).length,
    };
  });
  const top = [...districts].sort((a, b) => b.shops - a.shops).slice(0, 3);
  const maxShops = Math.max(1, ...top.map((row) => row.shops));
  const maxStatus = Math.max(1, ...data.statuses.map((row) => row.count));
  const paidShare = data.payouts.paid + data.payouts.pending === 0 ? 0 : Math.round((data.payouts.paid / (data.payouts.paid + data.payouts.pending)) * 100);
  const dots = Array.from({ length: 20 }, (_, index) => index < Math.round(data.completion.rate / 5));

  return (
    <div className="loop-stack">
      <div className="loop-widgets">
        <section className="loop-card">
          <header className="loop-board-head">
            <h2>{tx(locale, "Task completion rate", "কাজ শেষের হার")}</h2>
            <a className="loop-see" href={localePath(locale, "/admin/services")}>›</a>
          </header>
          <div className="loop-rate">{data.completion.rate}%</div>
          <div className="loop-dots" aria-hidden>
            {dots.map((on, index) => <i key={index} className={on ? "on" : ""} />)}
          </div>
          <p className="loop-sub">{tx(locale, `${data.completion.closed} of ${data.completion.total} orders are closed.`, `${data.completion.total}টির মধ্যে ${data.completion.closed}টি অর্ডার বন্ধ।`)}</p>
        </section>
        <section className="loop-card">
          <header className="loop-board-head">
            <h2>{tx(locale, "Orders by status", "অবস্থা অনুযায়ী অর্ডার")}</h2>
          </header>
          <div className="loop-bars">
            {data.statuses.length === 0 ? <span style={{ height: "12%" }} /> : null}
            {data.statuses.map((row) => (
              <span key={row.status} title={`${statusLabel(locale, row.status)} · ${row.count}`} style={{ height: `${Math.max(12, Math.round((row.count / maxStatus) * 100))}%` }} />
            ))}
          </div>
          <p className="loop-sub">{data.statuses.map((row) => statusLabel(locale, row.status)).join(" · ") || tx(locale, "No orders yet.", "এখনও অর্ডার নেই।")}</p>
        </section>
        <section className="loop-card">
          <header className="loop-board-head">
            <h2>{tx(locale, "Agreements overview", "চুক্তির সারাংশ")}</h2>
            <a className="loop-see" href={localePath(locale, "/admin/payouts")}>›</a>
          </header>
          <div className="loop-agree"><i style={{ width: `${paidShare}%` }} /></div>
          <div className="loop-pair">
            <div>
              <b>{data.payouts.paid}</b>
              <span>{tx(locale, "Paid batches", "পরিশোধিত ব্যাচ")}</span>
            </div>
            <div>
              <b>{data.payouts.pending}</b>
              <span>{tx(locale, "Pending batches", "বাকি ব্যাচ")}</span>
            </div>
          </div>
        </section>
        <section className="loop-card">
          <header className="loop-board-head">
            <h2>{tx(locale, "Coverage", "কভারেজ")}</h2>
            <a className="loop-see" href={localePath(locale, "/admin/coverage")}>›</a>
          </header>
          <div className="loop-bars">
            {top.length === 0 ? <span style={{ height: "12%" }} /> : null}
            {top.map((row) => (
              <span key={row.district} title={`${row.district} · ${row.shops}`} style={{ height: `${Math.max(16, Math.round((row.shops / maxShops) * 100))}%` }} />
            ))}
          </div>
          <p className="loop-sub">{top.map((row) => `${row.district} ${row.shops}/${row.experts}`).join(" · ") || tx(locale, "No pilot districts yet.", "এখনও জেলা নেই।")}</p>
        </section>
      </div>
      <section className="loop-card">
        <header className="loop-board-head">
          <h2>{tx(locale, "Weekly payout", "সাপ্তাহিক পেআউট")}</h2>
          <span className="loop-sub">{tx(locale, "Orders ready", "প্রস্তুত অর্ডার")}: {report?.waiting || 0}</span>
        </header>
        <form action={runPayoutBatch}>
          <input type="hidden" name="locale" value={locale} />
          <button className="loop-btn" type="submit">{tx(locale, "Create this week's batch", "এই সপ্তাহের ব্যাচ")}</button>
        </form>
        <div className="loop-table" style={{ marginTop: 12 }}>
          {payouts.map((payout) => (
            <div key={payout.id} className="loop-row" style={{ cursor: "default" }}>
              <span><strong>{payout.expert.displayName}</strong><em>{payout.orders.length} {tx(locale, "orders", "অর্ডার")}</em></span>
              <span className="loop-price">{formatInr(payout.amountPaise)}</span>
              <span className={payout.status === "PAID" ? "loop-status done" : "loop-status progress"}>{payout.status}</span>
              <span>
                {payout.status === "PENDING" ? (
                  <form action={markPayoutPaid}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="payoutId" value={payout.id} />
                    <button className="loop-btn" type="submit">{tx(locale, "Mark paid", "পরিশোধিত")}</button>
                  </form>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
