"use client";

import { useActionState, useMemo, useState } from "react";
import { hue, initials } from "@/lib/people";
import { localePath } from "@/lib/paths";
import { tx } from "@/lib/tx";
import { saveDirectoryUser } from "@/server/admin";

const CATEGORIES = [
  { id: "SHOP_OWNER", en: "Shop owner", bn: "দোকানের মালিক" },
  { id: "SHOP_STAFF", en: "Shop staff", bn: "দোকানের কর্মী" },
  { id: "EXPERT", en: "Expert", bn: "বিশেষজ্ঞ" },
  { id: "ADMIN", en: "Admin", bn: "অ্যাডমিন" },
] as const;

const CREDENTIALS = ["CA", "CMA", "GSTP", "FSSAI", "MUNICIPAL"];
const EXPERT_STATUS = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"];
const PLANS = [
  { id: "FREE", en: "Free", bn: "ফ্রি" },
  { id: "NOVICE", en: "Novice", bn: "নভিস" },
  { id: "GOLD", en: "Gold", bn: "গোল্ড" },
];

export type PersonProfile = {
  shopId?: string;
  shopName?: string;
  district?: string;
  pincode?: string;
  address?: string;
  credentialType?: string;
  credentialNumber?: string;
  status?: string;
  plan?: string;
};

export type DirectoryPerson = {
  id: string;
  name: string;
  phone: string;
  role: string;
  place: string;
  detail: string;
  joined: string;
  profile: PersonProfile;
};

type ShopOption = { id: string; name: string; district: string };
type PinOption = { pincode: string; district: string; area: string };
type Tab = { id: string; label: string; count: number; href: string; on: boolean };

const CHIP: Record<string, [string, string]> = {
  SHOP_OWNER: ["Shop owners", "দোকানের মালিক"],
  SHOP_STAFF: ["Shop staff", "দোকানের কর্মী"],
  EXPERT: ["Experts", "বিশেষজ্ঞ"],
  ADMIN: ["Admins", "অ্যাডমিন"],
};

function categoryLabel(locale: string, role: string) {
  const pair = CHIP[role];
  return pair ? tx(locale, pair[0], pair[1]) : role;
}

function chipClass(role: string) {
  if (role === "EXPERT") return "review";
  if (role === "ADMIN") return "draft";
  if (role === "SHOP_STAFF") return "progress";
  return "done";
}

export function PeopleDesk({
  locale,
  role,
  q,
  returnTo,
  people,
  shops,
  pins,
  tabs,
  page,
  pages,
  from,
  to,
  total,
}: {
  locale: string;
  role: string;
  q: string;
  returnTo: string;
  people: DirectoryPerson[];
  shops: ShopOption[];
  pins: PinOption[];
  tabs: Tab[];
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const start = Math.max(1, page - 2);
  const hrefFor = (number: number) => {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (q) params.set("q", q);
    if (number > 1) params.set("page", String(number));
    const query = params.toString();
    return localePath(locale, query ? `/admin?${query}` : "/admin");
  };
  const end = Math.min(pages, start + 4);
  return (
    <section className="loop-card loop-users">
      <header className="loop-board-head">
        <h2>{tx(locale, "Everyone", "সবাই")}</h2>
        <div className="loop-user-tools">
          <form className="loop-search" action={localePath(locale, "/admin")} method="get">
            {role ? <input type="hidden" name="role" value={role} /> : null}
            <span aria-hidden>⌕</span>
            <input name="q" defaultValue={q} placeholder={tx(locale, "Name or mobile", "নাম বা মোবাইল")} />
          </form>
          <button className="loop-btn" type="button" onClick={() => setOpen(open === "new" ? null : "new")}>
            {tx(locale, "Add person", "যোগ করুন")}
          </button>
        </div>
      </header>
      <div className="loop-tabs">
        {tabs.map((tab) => (
          <a key={tab.id || "all"} className={tab.on ? "on" : ""} href={tab.href}>
            {tab.label}
            <b>{tab.count}</b>
          </a>
        ))}
      </div>
      {open === "new" ? (
        <PersonForm
          locale={locale}
          returnTo={returnTo}
          shops={shops}
          pins={pins}
          onClose={() => setOpen(null)}
        />
      ) : null}
      <div className="loop-user-head">
        <span>{tx(locale, "Person", "ব্যক্তি")}</span>
        <span>{tx(locale, "Mobile", "মোবাইল")}</span>
        <span>{tx(locale, "Category", "বিভাগ")}</span>
        <span>{tx(locale, "Works with", "সংযুক্ত")}</span>
        <span>{tx(locale, "Joined", "যোগ")}</span>
      </div>
      {people.length === 0 ? <p className="loop-empty">{tx(locale, "No one matches this filter.", "এই ফিল্টারে কেউ নেই।")}</p> : null}
      {people.map((person) => (
        <div key={person.id}>
          <div className="loop-user-row">
            <span className="loop-who">
              <i style={{ background: hue(person.name) }}>{initials(person.name)}</i>
              <span>
                <strong>{person.name}</strong>
                <em>{person.role === "EXPERT" ? "" : person.detail}</em>
              </span>
            </span>
            <span>{person.phone}</span>
            <span className={`loop-status ${chipClass(person.role)}`}>{categoryLabel(locale, person.role)}</span>
            <span>
              <strong>{person.place}</strong>
              <em>
                {person.role === "SHOP_OWNER"
                  ? tx(locale, PLANS.find((item) => item.id === (person.profile.plan || "FREE"))?.en || "Free", PLANS.find((item) => item.id === (person.profile.plan || "FREE"))?.bn || "ফ্রি")
                  : person.role === "EXPERT"
                    ? person.detail
                    : ""}
              </em>
            </span>
            <span className="loop-user-meta">
              <span>{person.joined}</span>
              <button type="button" onClick={() => setOpen(open === person.id ? null : person.id)}>
                {tx(locale, "Manage", "বদলান")}
              </button>
            </span>
          </div>
          {open === person.id ? (
            <PersonForm
              locale={locale}
              returnTo={returnTo}
              shops={shops}
              pins={pins}
              person={person}
              onClose={() => setOpen(null)}
            />
          ) : null}
        </div>
      ))}
      <div className="loop-pages">
        <span key="range" className="loop-sub">{tx(locale, `${from}–${to} of ${total}`, `${total} জনের ${from}–${to}`)}</span>
        {page > 1 ? <a key="prev" href={hrefFor(page - 1)}>{tx(locale, "Prev", "আগে")}</a> : <span key="prev" className="off">{tx(locale, "Prev", "আগে")}</span>}
        {Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index).map((number) => (
          <a key={`page-${number}`} className={number === page ? "on" : ""} href={hrefFor(number)}>
            {number}
          </a>
        ))}
        {page < pages ? <a key="next" href={hrefFor(page + 1)}>{tx(locale, "Next", "পরে")}</a> : <span key="next" className="off">{tx(locale, "Next", "পরে")}</span>}
      </div>
    </section>
  );
}

function PersonForm({
  locale,
  returnTo,
  shops,
  pins,
  person,
  onClose,
}: {
  locale: string;
  returnTo: string;
  shops: ShopOption[];
  pins: PinOption[];
  person?: DirectoryPerson;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(saveDirectoryUser, {} as { error?: string });
  const [role, setRole] = useState(person?.role || "SHOP_OWNER");
  const districts = useMemo(() => [...new Set(pins.map((pin) => pin.district))], [pins]);
  const initialDistrict = person?.profile.district || districts[0] || "";
  const [district, setDistrict] = useState(initialDistrict);
  const localPins = pins.filter((pin) => pin.district === district);
  const locked = Boolean(person);
  return (
    <form action={action} className="loop-form loop-user-panel">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {person ? <input type="hidden" name="userId" value={person.id} /> : null}
      {person ? <input type="hidden" name="role" value={person.role} /> : null}
      <p className="loop-sub wide">
        {person
          ? tx(locale, "Category stays the same. They keep signing in with the mobile saved here.", "বিভাগ একই থাকবে। এই মোবাইল দিয়েই লগইন করবেন।")
          : tx(locale, "They sign in later with this mobile and a one-time code. No code is needed to create the account.", "পরে এই মোবাইল ও একবারের কোড দিয়ে লগইন করবেন। অ্যাকাউন্ট খুলতে কোড লাগে না।")}
      </p>
      {state.error ? <p className="loop-alert wide">{state.error}</p> : null}
      {locked ? null : (
        <label>
          {tx(locale, "Category", "বিভাগ")}
          <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {tx(locale, item.en, item.bn)}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        {tx(locale, "Name", "নাম")}
        <input name="name" required minLength={2} maxLength={80} defaultValue={person?.name || ""} />
      </label>
      <label>
        {tx(locale, "Mobile", "মোবাইল")}
        <input name="phone" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} defaultValue={person?.phone || ""} />
      </label>
      {role === "SHOP_STAFF" ? (
        <label>
          {tx(locale, "Shop", "দোকান")}
          <select name="shopId" defaultValue={person?.profile.shopId || shops[0]?.id || ""} required>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name} · {shop.district}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {role === "SHOP_OWNER" || role === "EXPERT" ? (
        <label>
          {tx(locale, "District", "জেলা")}
          <select
            name="district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          >
            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {role === "SHOP_OWNER" ? (
        <>
          <label>
            {tx(locale, "PIN", "পিন")}
            <select key={district} name="pincode" defaultValue={person?.profile.pincode || localPins[0]?.pincode || ""} required>
              {localPins.map((pin) => (
                <option key={pin.pincode} value={pin.pincode}>
                  {pin.pincode} — {pin.area}
                </option>
              ))}
            </select>
          </label>
          <label>
            {tx(locale, "Shop name", "দোকানের নাম")}
            <input name="shopName" required minLength={2} maxLength={80} defaultValue={person?.profile.shopName || ""} />
          </label>
          <label>
            {tx(locale, "Membership", "সদস্যপদ")}
            <select name="plan" defaultValue={person?.profile.plan || "FREE"}>
              {PLANS.map((item) => (
                <option key={item.id} value={item.id}>{tx(locale, item.en, item.bn)}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            {tx(locale, "Address", "ঠিকানা")}
            <input name="address" maxLength={200} defaultValue={person?.profile.address || ""} />
          </label>
        </>
      ) : null}
      {role === "EXPERT" ? (
        <>
          <label>
            {tx(locale, "Credential", "যোগ্যতা")}
            <select name="credentialType" defaultValue={person?.profile.credentialType || "CA"}>
              {CREDENTIALS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            {tx(locale, "Credential number", "যোগ্যতার নম্বর")}
            <input name="credentialNumber" required minLength={3} maxLength={40} defaultValue={person?.profile.credentialNumber || ""} />
          </label>
          <label>
            {tx(locale, "Status", "অবস্থা")}
            <select name="status" defaultValue={person?.profile.status || "PENDING"}>
              {EXPERT_STATUS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
      <div className="loop-user-save wide">
        <button className="loop-btn" type="submit" disabled={pending}>
          {pending ? tx(locale, "Saving", "সেভ হচ্ছে") : tx(locale, "Save", "সেভ")}
        </button>
        <button type="button" onClick={onClose}>
          {tx(locale, "Close", "বন্ধ")}
        </button>
      </div>
    </form>
  );
}
