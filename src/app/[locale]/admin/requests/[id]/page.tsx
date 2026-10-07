import { InputBox } from "@/components/ant";
import { NamedCheck } from "@/components/fields";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { formatInr } from "@/lib/money";
import { localePath } from "@/lib/paths";
import { eventLabel, performedBy, statusLabel, tx } from "@/lib/tx";
import { addRequestFile, assignRequest, updateRequestStatus } from "@/server/admin";

const STATUSES = ["SUBMITTED", "AWAITING_PAYMENT", "EXPERT_ACCEPTED", "DOCUMENTS_QUERIED", "FILED", "ACK_UPLOADED", "CLOSED", "DECLINED", "CANCELLED"];

function shownKey(key: string) {
  return key.startsWith("extra:") ? key.slice(6) : key;
}

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, id } = await params;
  const { error } = await searchParams;
  const payload = await apiGet<{
    order: {
      id: string;
      srNumber: string | null;
      status: string;
      customerName: string;
      customerPhone: string;
      pincode: string;
      formData: Record<string, string>;
      expertFeePaise: number;
      shop: { name: string } | null;
      service: { nameEn: string } | null;
      expert: { displayName: string; credentialType?: string; user?: { role: string } | null } | null;
      files: { id: string; fileName: string; docKey: string; uploadedByName: string; uploadedByRole: string }[];
      events: { id: string; type: string; note: string | null; createdAt: string; actorName: string; actorRole: string }[];
    };
    experts: { id: string; name: string; district: string; feePaise: number; kind: "expert" | "admin" }[];
  }>(adminPath(`/requests/${id}`));
  if (!payload) {
    return <section className="loop-card"><p>{tx(locale, "This request was not found.", "এই অনুরোধ পাওয়া যায়নি।")}</p></section>;
  }
  const { order, experts } = payload;
  return (
    <div className="ledger-grid">
      <section className="loop-card" style={{ marginTop: 0 }}>
        <p className="loop-sub"><a href={localePath(locale, "/admin/requests")}>{tx(locale, "All requests", "সব অনুরোধ")}</a></p>
        <h2>{order.srNumber || order.id}</h2>
        <p className="loop-sub">{order.shop?.name} · {order.service?.nameEn} · {statusLabel(locale, order.status)}</p>
        <p>{order.customerName} · {order.customerPhone} · {order.pincode}</p>
        {error ? <p className="loop-alert">{tx(locale, "That update was not saved.", "এই আপডেট সেভ হয়নি।")}</p> : null}
        <table className="ledger-table">
          <tbody>
            {Object.entries(order.formData || {}).map(([key, value]) => (
              <tr key={key}><th>{shownKey(key)}</th><td>{value}</td></tr>
            ))}
          </tbody>
        </table>
        <h2 style={{ marginTop: 22 }}>{tx(locale, "Assign", "দায়িত্ব দিন")}</h2>
        <p className="loop-sub">{tx(locale, "Attach a verified expert, or an admin working as the expert.", "একজন যাচাই করা বিশেষজ্ঞ, অথবা বিশেষজ্ঞ হিসেবে কাজ করা অ্যাডমিনকে দিন।")}</p>
        {order.expert ? (
          <p className="loop-sub">
            {tx(locale, "Currently", "এখন")}: {order.expert.displayName}
            {order.expert.user?.role === "ADMIN" || order.expert.credentialType === "ADMIN" ? ` · ${tx(locale, "Admin", "অ্যাডমিন")}` : ""}
          </p>
        ) : null}
        {experts.length === 0 ? <p className="loop-sub">{tx(locale, "No verified expert or admin can take this request yet.", "এই অনুরোধে এখনও কোনো বিশেষজ্ঞ বা অ্যাডমিন নেই।")}</p> : (
        <form action={assignRequest} className="loop-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="orderId" value={order.id} />
          <label>
            {tx(locale, "Expert or admin", "বিশেষজ্ঞ বা অ্যাডমিন")}
            <select name="assignee" required defaultValue={experts[0]?.id || ""}>
              {experts.map((expert) => (
                <option key={expert.id} value={expert.id}>
                  {expert.kind === "admin"
                    ? `${expert.name} · ${tx(locale, "Admin", "অ্যাডমিন")} · ${tx(locale, "Revenue", "আয়")} ${formatInr(expert.feePaise)}`
                    : `${expert.name} · ${expert.district} · ${formatInr(expert.feePaise)}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            {tx(locale, "Remark", "মন্তব্য")}
            <InputBox name="remark" required placeholder={tx(locale, "Why this person", "কেন এই ব্যক্তি")} />
          </label>
          <button className="loop-btn" type="submit">{tx(locale, "Assign", "দায়িত্ব দিন")}</button>
        </form>
        )}
        <h2 style={{ marginTop: 22 }}>{tx(locale, "Status", "অবস্থা")}</h2>
        <form action={updateRequestStatus} className="loop-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="orderId" value={order.id} />
          <label>
            {tx(locale, "New status", "নতুন অবস্থা")}
            <select name="status" defaultValue={order.status}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{statusLabel(locale, status)}</option>
              ))}
            </select>
          </label>
          <label>
            {tx(locale, "Remark", "মন্তব্য")}
            <InputBox name="remark" required />
          </label>
          <button className="loop-btn" type="submit">{tx(locale, "Save status", "স্ট্যাটাস সেভ করুন")}</button>
        </form>
        <h2 style={{ marginTop: 22 }}>{tx(locale, "Add a document", "কাগজ যোগ করুন")}</h2>
        <form action={addRequestFile} className="loop-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="orderId" value={order.id} />
          <label>
            {tx(locale, "Document name", "কাগজের নাম")}
            <InputBox name="name" required />
          </label>
          <label>
            {tx(locale, "File", "ফাইল")}
            <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" />
          </label>
          {process.env.NODE_ENV !== "production" ? <NamedCheck name="demo">{tx(locale, "Sample file", "নমুনা ফাইল")}</NamedCheck> : null}
          <button className="loop-btn" type="submit">{tx(locale, "Upload", "আপলোড")}</button>
        </form>
      </section>
      <section className="loop-card" style={{ marginTop: 0 }}>
        <h2>{tx(locale, "Documents", "কাগজ")}</h2>
        {order.files.length === 0 ? <p className="loop-sub">{tx(locale, "No documents yet.", "এখনও কোনো কাগজ নেই।")}</p> : (
          <table className="ledger-table">
            <tbody>
              {order.files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <a href={`/api/files/${file.id}`}>{file.fileName}</a>
                    <div className="loop-sub">{shownKey(file.docKey)} · {tx(locale, "Uploaded by", "আপলোড করেছেন")} {performedBy(locale, file.uploadedByName, file.uploadedByRole)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h2 style={{ marginTop: 22 }}>{tx(locale, "Status history", "স্ট্যাটাসের ইতিহাস")}</h2>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>{tx(locale, "When", "সময়")}</th>
              <th>{tx(locale, "Performed by", "কে করেছে")}</th>
              <th>{tx(locale, "What", "কী")}</th>
              <th>{tx(locale, "Note", "নোট")}</th>
            </tr>
          </thead>
          <tbody>
            {order.events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.createdAt).toLocaleString(locale === "bn" ? "bn-IN" : "en-IN")}</td>
                <td>{performedBy(locale, event.actorName, event.actorRole)}</td>
                <td>{eventLabel(locale, event.type)}</td>
                <td>{event.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
