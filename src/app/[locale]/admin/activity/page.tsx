import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { performedBy, tx } from "@/lib/tx";

type ActivityRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  createdAt: string;
  actorName: string;
  actorRole: string;
};

const ACTIONS: Record<string, [string, string]> = {
  "file.upload": ["Uploaded a file", "ফাইল আপলোড"],
  "file.download": ["Downloaded a file", "ফাইল ডাউনলোড"],
  "order.create": ["Created a request", "অনুরোধ তৈরি"],
  "order.deletion_requested": ["Requested file deletion", "ফাইল মুছে ফেলার অনুরোধ"],
  "order.purge": ["Deleted stored files", "সংরক্ষিত ফাইল মুছেছে"],
  "staff.add": ["Added counter staff", "কাউন্টার কর্মী যোগ"],
  "loan.referral": ["Recorded a loan referral", "ঋণ রেফারেল লিখেছে"],
  "expert.status": ["Updated an expert", "বিশেষজ্ঞ আপডেট"],
  "service.create": ["Created a service", "পরিষেবা তৈরি"],
  "service.image": ["Updated a service image", "পরিষেবার ছবি আপডেট"],
  "dispute.resolve": ["Resolved a dispute", "অভিযোগ মিটিয়েছে"],
  "payout.batch": ["Created a payout batch", "পেআউট ব্যাচ তৈরি"],
  "payout.paid": ["Marked a payout paid", "পেআউট পরিশোধিত"],
  "payment.capture": ["Recorded a payment", "পেমেন্ট লিখেছে"],
  "ledger.credit": ["Credited a shop", "দোকানে টাকা জমা"],
};

function when(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function actionLabel(locale: string, action: string) {
  const pair = ACTIONS[action];
  if (!pair) return action;
  return tx(locale, pair[0], pair[1]);
}

export default async function ActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const rows = (await apiGet<ActivityRow[]>(adminPath("/activity"))) || [];
  return (
    <section className="loop-card" style={{ marginTop: 0 }}>
      <h2>{tx(locale, "Activity", "কার্যক্রম")}</h2>
      <p className="loop-sub">{tx(locale, "Each row names the person who performed the action.", "প্রতিটি সারিতে কাজটি কে করেছে তা লেখা আছে।")}</p>
      {rows.length === 0 ? <p className="loop-sub">{tx(locale, "No activity yet.", "এখনও কোনো কার্যক্রম নেই।")}</p> : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>{tx(locale, "When", "সময়")}</th>
              <th>{tx(locale, "Performed by", "কে করেছে")}</th>
              <th>{tx(locale, "Action", "কাজ")}</th>
              <th>{tx(locale, "Detail", "বিবরণ")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{when(row.createdAt, locale)}</td>
                <td>{performedBy(locale, row.actorName, row.actorRole)}</td>
                <td>{actionLabel(locale, row.action)}</td>
                <td>{row.detail || row.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
