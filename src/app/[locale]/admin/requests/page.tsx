import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { localePath } from "@/lib/paths";
import { statusLabel, tx } from "@/lib/tx";

export default async function RequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const rows = (await apiGet<{
    id: string;
    srNumber: string | null;
    status: string;
    customerName: string;
    shopName: string;
    serviceName: string;
    createdAt: string;
  }[]>(adminPath("/requests"))) || [];
  return (
    <section className="loop-card" style={{ marginTop: 0 }}>
      <h2>{tx(locale, "Service requests", "সার্ভিস রিকোয়েস্ট")}</h2>
      <p className="loop-sub">{tx(locale, "Open a request to attach an expert or an admin, add a document, or record a status remark.", "বিশেষজ্ঞ বা অ্যাডমিন দিতে, কাগজ যোগ করতে, বা স্ট্যাটাসের মন্তব্য লিখতে একটি অনুরোধ খুলুন।")}</p>
      {rows.length === 0 ? <p className="loop-sub">{tx(locale, "No service requests yet.", "এখনও কোনো সার্ভিস রিকোয়েস্ট নেই।")}</p> : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>{tx(locale, "SR", "এসআর")}</th>
              <th>{tx(locale, "Shop", "দোকান")}</th>
              <th>{tx(locale, "Service", "পরিষেবা")}</th>
              <th>{tx(locale, "Status", "অবস্থা")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><a href={localePath(locale, `/admin/requests/${row.id}`)}>{row.srNumber || row.id}</a></td>
                <td>{row.shopName}<div className="loop-sub">{row.customerName}</div></td>
                <td>{row.serviceName}</td>
                <td>{statusLabel(locale, row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
