import { ProjectsView } from "@/components/loop/projects-view";
import { NamedCheck, NamedSelect } from "@/components/fields";
import { InputBox, TextArea } from "@/components/ant";
import { apiGet } from "@/lib/api";
import { adminPath, type BoardOrder } from "@/lib/admin";
import { tx } from "@/lib/tx";
import { addServiceDocument, addServiceField, saveService, uploadServiceImage } from "@/server/admin";

export default async function AdminServices({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const [orders, services] = await Promise.all([
    apiGet<BoardOrder[]>(adminPath("/orders")),
    apiGet<{
      id: string;
      slug: string;
      nameEn: string;
      nameBn: string;
      summaryEn: string;
      summaryBn: string;
      officialUrl: string | null;
      imageUrl: string | null;
      minFeePaise: number;
      maxFeePaise: number;
      costPaise: number;
      chargePaise: number;
      profitPaise: number;
      active: boolean;
      fields: { key: string }[];
      documents: { key: string }[];
    }[]>(adminPath("/services")),
  ]);
  const list = services || [];
  const serviceOptions = list.map((service) => ({ value: service.id, label: service.slug }));
  return (
    <ProjectsView
      locale={locale}
      orders={orders || []}
      catalogue={
        <div className="loop-stack">
          {error === "aadhaar" ? <p className="loop-alert">{tx(locale, "Aadhaar fields are blocked.", "আধার ফিল্ড বন্ধ।")}</p> : null}
          {error === "image" ? <p className="loop-alert">{tx(locale, "Upload a JPG, PNG, or WebP under 5 MB.", "৫ এমবির মধ্যে JPG, PNG, বা WebP দিন।")}</p> : null}
          {list.map((service) => (
            <section key={service.id} className="loop-card">
              <form action={saveService} className="loop-form">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={service.id} />
                <strong>{service.slug}</strong>
                <label>English name<InputBox name="nameEn" defaultValue={service.nameEn} /></label>
                <label>বাংলা নাম<InputBox name="nameBn" defaultValue={service.nameBn} /></label>
                <label>Summary EN<TextArea name="summaryEn" defaultValue={service.summaryEn} /></label>
                <label>সারাংশ<TextArea name="summaryBn" defaultValue={service.summaryBn} /></label>
                <label>URL<InputBox name="officialUrl" defaultValue={service.officialUrl || ""} /></label>
                <label>{tx(locale, "Cost ₹", "খরচ ₹")}<InputBox name="costRupees" type="number" min={0} step="1" defaultValue={service.costPaise / 100} /></label>
                <label>{tx(locale, "Charge ₹", "চার্জ ₹")}<InputBox name="chargeRupees" type="number" min={0} step="1" defaultValue={service.chargePaise / 100} /></label>
                <p className="loop-mini">{tx(locale, "Profit", "লাভ")} ₹{service.profitPaise / 100}</p>
                <label>Min ₹<InputBox name="minFeeRupees" type="number" defaultValue={service.minFeePaise / 100} /></label>
                <label>Max ₹<InputBox name="maxFeeRupees" type="number" defaultValue={service.maxFeePaise / 100} /></label>
                <NamedCheck name="active" defaultChecked={service.active}>{tx(locale, "Active", "সক্রিয়")}</NamedCheck>
                <p className="loop-mini">{service.fields.map((field) => field.key).join(", ") || "—"} · {service.documents.map((doc) => doc.key).join(", ")}</p>
                <button className="loop-btn" type="submit">{tx(locale, "Save service", "সেভ")}</button>
              </form>
              <form action={uploadServiceImage} className="loop-form service-shot-form">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={service.id} />
                {service.imageUrl ? <img className="service-shot" src={service.imageUrl} alt="" /> : <p className="loop-mini">{tx(locale, "No image yet.", "এখনও ছবি নেই।")}</p>}
                <label>
                  {tx(locale, "Service image", "পরিষেবার ছবি")}
                  <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
                </label>
                <button className="loop-btn" type="submit">{tx(locale, "Upload image", "ছবি আপলোড")}</button>
              </form>
            </section>
          ))}
          <section className="loop-card" id="create">
            <h2>{tx(locale, "Add a service", "নতুন পরিষেবা")}</h2>
            <form action={saveService} className="loop-form">
              <input type="hidden" name="locale" value={locale} />
              <label>Slug<InputBox name="slug" required /></label>
              <label>English name<InputBox name="nameEn" required /></label>
              <label>বাংলা নাম<InputBox name="nameBn" required /></label>
              <label>Summary EN<TextArea name="summaryEn" /></label>
              <label>সারাংশ<TextArea name="summaryBn" /></label>
              <label>Lane<NamedSelect name="lane" defaultValue="PROFESSIONAL" options={["PROFESSIONAL", "PORTAL"].map((value) => ({ value, label: value }))} /></label>
              <label>Kind<NamedSelect name="kind" defaultValue="PROFESSIONAL" options={["PROFESSIONAL", "CHECKLIST", "TICKET"].map((value) => ({ value, label: value }))} /></label>
              <label>Fulfillment<NamedSelect name="fulfillment" defaultValue="EXPERT" options={["EXPERT", "EITHER", "SELF"].map((value) => ({ value, label: value }))} /></label>
              <label>Credential list<InputBox name="credential" placeholder="CA,CMA,GSTP" /></label>
              <label>URL<InputBox name="officialUrl" /></label>
              <label>{tx(locale, "Cost ₹", "খরচ ₹")}<InputBox name="costRupees" type="number" min={0} step="1" defaultValue={0} /></label>
              <label>{tx(locale, "Charge ₹", "চার্জ ₹")}<InputBox name="chargeRupees" type="number" min={0} step="1" defaultValue={0} /></label>
              <label>Min ₹<InputBox name="minFeeRupees" type="number" defaultValue={0} /></label>
              <label>Max ₹<InputBox name="maxFeeRupees" type="number" defaultValue={0} /></label>
              <NamedCheck name="active" defaultChecked>Active</NamedCheck>
              <button className="loop-btn" type="submit">{tx(locale, "Create", "তৈরি")}</button>
            </form>
          </section>
          <section className="loop-card">
            <h2>{tx(locale, "Add a field", "ফিল্ড যোগ")}</h2>
            <form action={addServiceField} className="loop-form">
              <input type="hidden" name="locale" value={locale} />
              <NamedSelect name="serviceId" defaultValue={list[0]?.id || ""} options={serviceOptions} />
              <InputBox name="key" placeholder="field_key" required />
              <InputBox name="labelEn" placeholder="English label" required />
              <InputBox name="labelBn" placeholder="বাংলা লেবেল" required />
              <NamedSelect name="fieldType" defaultValue="text" options={["text", "number", "textarea", "select"].map((value) => ({ value, label: value }))} />
              <NamedCheck name="required" defaultChecked>Required</NamedCheck>
              <button className="loop-btn" type="submit">{tx(locale, "Add field", "ফিল্ড")}</button>
            </form>
          </section>
          <section className="loop-card">
            <h2>{tx(locale, "Add a document", "কাগজ যোগ")}</h2>
            <form action={addServiceDocument} className="loop-form">
              <input type="hidden" name="locale" value={locale} />
              <NamedSelect name="serviceId" defaultValue={list[0]?.id || ""} options={serviceOptions} />
              <InputBox name="key" placeholder="doc_key" required />
              <InputBox name="labelEn" placeholder="English label" required />
              <InputBox name="labelBn" placeholder="বাংলা লেবেল" required />
              <NamedCheck name="required" defaultChecked>Required</NamedCheck>
              <button className="loop-btn" type="submit">{tx(locale, "Add document", "কাগজ")}</button>
            </form>
          </section>
        </div>
      }
    />
  );
}
