import { RevenueChart } from "@/components/loop/chart";
import { Assistant } from "@/components/loop/assistant";
import { ProjectBoard } from "@/components/loop/board";
import { PeopleDesk, type DirectoryPerson } from "@/components/loop/people-desk";
import { apiGet } from "@/lib/api";
import { adminPath, EMPTY_DASHBOARD, type Dashboard } from "@/lib/admin";
import { formatInr } from "@/lib/money";
import { when } from "@/lib/people";
import { localePath } from "@/lib/paths";
import { getSession } from "@/lib/session";
import { tx } from "@/lib/tx";

const PAGE_SIZE = 5;
const ROLES = [
  { id: "", en: "All", bn: "সব" },
  { id: "SHOP_OWNER", en: "Shop owners", bn: "দোকানের মালিক" },
  { id: "SHOP_STAFF", en: "Shop staff", bn: "দোকানের কর্মী" },
  { id: "EXPERT", en: "Experts", bn: "বিশেষজ্ঞ" },
  { id: "ADMIN", en: "Admins", bn: "অ্যাডমিন" },
] as const;

type DirectoryUser = {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string | Date;
  place: string;
  detail: string;
  profile?: DirectoryPerson["profile"];
};

type ShopOption = { id: string; name: string; district: string };
type PinOption = { pincode: string; district: string; area: string };

type Directory = {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  counts: Record<string, number>;
  users: DirectoryUser[];
};

function peopleQuery(role: string, q: string, page: number) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function peopleHref(locale: string, role: string, q: string, page: number) {
  return localePath(locale, peopleQuery(role, q, page));
}

function Delta({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value === null || value === 0) return <span className="loop-delta up">0{suffix}</span>;
  const up = value > 0;
  return <span className={up ? "loop-delta up" : "loop-delta down"}>{up ? `+${value}` : value}{suffix}</span>;
}

export default async function AdminHome({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const role = ROLES.some((item) => item.id === query.role) ? query.role || "" : "";
  const q = (query.q || "").trim().slice(0, 80);
  const requested = Number(query.page || "1");
  const page = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1;
  const session = await getSession();
  const listQuery = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (role) listQuery.set("role", role);
  if (q) listQuery.set("q", q);
  const [board, directory, shops, pins] = await Promise.all([
    apiGet<Dashboard>(adminPath("/dashboard")),
    apiGet<Directory>(adminPath(`/users?${listQuery.toString()}`)),
    apiGet<ShopOption[]>(adminPath("/shops")),
    apiGet<PinOption[]>("/v1/pincodes"),
  ]);
  const data = board || EMPTY_DASHBOARD;
  const signals = data.signals;
  const insight = signals.openDisputes
    ? tx(locale, `${signals.openDisputes} open disputes need a decision before payouts can include those orders.`, `${signals.openDisputes}টি খোলা অভিযোগের সিদ্ধান্ত বাকি।`)
    : signals.pendingExperts
      ? tx(locale, `${signals.pendingExperts} experts are waiting. Verify them before they can take orders.`, `${signals.pendingExperts} জন বিশেষজ্ঞ যাচাইয়ের অপেক্ষায়।`)
      : signals.revenueDelta !== null && signals.revenueDelta < 0
        ? tx(locale, "Collections are behind the same stretch last month. Clear disputes and send the payout batch.", "গত মাসের একই সময়ের চেয়ে আদায় কম। অভিযোগ মিটান এবং পেআউট পাঠান।")
        : tx(locale, "Paid orders in covered PINs are ready for the weekly expert transfer.", "কভার করা পিনের পরিশোধিত অর্ডার সাপ্তাহিক পেআউটের জন্য প্রস্তুত।");

  return (
    <div className="loop-home">
      <div>
        <div className="loop-metrics">
          <article className="loop-metric">
            <header>
              <p>{tx(locale, "Clients", "ক্লায়েন্ট")}</p>
              <Delta value={data.shops.delta} />
            </header>
            <strong>{data.shops.count}</strong>
            <span>{tx(locale, `Compare ${data.shops.previous} last month`, `গত মাসে ${data.shops.previous}`)}</span>
          </article>
          <article className="loop-metric">
            <header>
              <p>{tx(locale, "Revenue", "আয়")}</p>
              <Delta value={data.revenue.delta} suffix="%" />
            </header>
            <strong>{formatInr(data.revenue.monthPaise)}</strong>
            <span>{tx(locale, `${formatInr(data.revenue.previousPaise)} last month`, `গত মাসে ${formatInr(data.revenue.previousPaise)}`)}</span>
          </article>
          <article className="loop-metric">
            <header>
              <p>{tx(locale, "Projects", "প্রকল্প")}</p>
              <Delta value={data.orders.delta} />
            </header>
            <strong>{data.orders.count}</strong>
            <span>{tx(locale, `Compare ${data.orders.previous} last month`, `গত মাসে ${data.orders.previous}`)}</span>
          </article>
        </div>
        <section className="loop-card loop-revenue">
          <header className="loop-board-head">
            <h2>{tx(locale, "Revenue analytics", "আয় বিশ্লেষণ")}</h2>
            <span className="loop-sub">{tx(locale, "Paid · last 30 days", "পরিশোধিত · গত ৩০ দিন")} · {data.recharge?.enabled ? tx(locale, "Recharge on", "রিচার্জ চালু") : tx(locale, "Recharge off", "রিচার্জ বন্ধ")}</span>
          </header>
          <div className="loop-revenue-grid">
            <div>
              <div className="loop-legend">
                <span><i className="actual" />{tx(locale, "Actual", "প্রকৃত")}</span>
                <span><i className="trend" />{tx(locale, "7-day trend", "৭ দিনের ধারা")}</span>
              </div>
              <p className="loop-insight">{insight}</p>
              <a className="loop-btn" href={localePath(locale, "/admin/analytics")} style={{ marginTop: 12 }}>
                {tx(locale, "Run analysis", "বিশ্লেষণ")}
              </a>
            </div>
            <RevenueChart locale={locale} series={data.series} />
          </div>
        </section>
        <ProjectBoard locale={locale} orders={data.recentOrders} title={tx(locale, "Manage projects", "প্রকল্প")} />
      </div>
      <aside className="loop-side">
        <section className="loop-card">
          <header className="loop-board-head">
            <h2>{tx(locale, "Priority tasks", "জরুরি কাজ")}</h2>
            <a className="loop-see" href={localePath(locale, "/admin/disputes")}>{tx(locale, "See all", "সব")}</a>
          </header>
          <ul className="loop-tasks">
            <li>
              <a href={localePath(locale, "/admin/experts")}>
                <i>✓</i>
                <span>
                  <strong>{tx(locale, "Verify experts", "বিশেষজ্ঞ যাচাই")}</strong>
                  <em>{tx(locale, `${signals.pendingExperts} pending`, `${signals.pendingExperts} জন বাকি`)}</em>
                </span>
                <b>›</b>
              </a>
            </li>
            <li>
              <a href={localePath(locale, "/admin/disputes")}>
                <i>!</i>
                <span>
                  <strong>{tx(locale, "Resolve disputes", "অভিযোগ মিটান")}</strong>
                  <em>{tx(locale, `${signals.openDisputes} open`, `${signals.openDisputes}টি খোলা`)}</em>
                </span>
                <b>›</b>
              </a>
            </li>
            <li>
              <a href={localePath(locale, "/admin/payouts")}>
                <i>₹</i>
                <span>
                  <strong>{tx(locale, "Weekly payout", "সাপ্তাহিক পেআউট")}</strong>
                  <em>{tx(locale, `${signals.waitingPayouts} orders ready`, `${signals.waitingPayouts}টি অর্ডার প্রস্তুত`)}</em>
                </span>
                <b>›</b>
              </a>
            </li>
          </ul>
        </section>
        <Assistant
          locale={locale}
          name={session?.name || tx(locale, "there", "বন্ধু")}
          pendingExperts={signals.pendingExperts}
          openDisputes={signals.openDisputes}
          waitingPayouts={signals.waitingPayouts}
        />
      </aside>
      <PeopleDirectory locale={locale} role={role} q={q} people={directory} shops={shops || []} pins={pins || []} />
    </div>
  );
}

function PeopleDirectory({
  locale,
  role,
  q,
  people,
  shops,
  pins,
}: {
  locale: string;
  role: string;
  q: string;
  people: Directory | null;
  shops: ShopOption[];
  pins: PinOption[];
}) {
  const list = people || { page: 1, pageSize: PAGE_SIZE, total: 0, pages: 1, counts: {}, users: [] };
  const all = ROLES.reduce((sum, item) => sum + (item.id ? list.counts[item.id] || 0 : 0), 0);
  const from = list.total === 0 ? 0 : (list.page - 1) * list.pageSize + 1;
  const to = Math.min(list.total, list.page * list.pageSize);
  return (
    <PeopleDesk
      locale={locale}
      role={role}
      q={q}
      returnTo={peopleQuery(role, q, list.page)}
      shops={shops}
      pins={pins}
      page={list.page}
      pages={list.pages}
      from={from}
      to={to}
      total={list.total}
      tabs={ROLES.map((item) => ({
        id: item.id,
        label: tx(locale, item.en, item.bn),
        count: item.id ? list.counts[item.id] || 0 : all,
        href: peopleHref(locale, item.id, q, 1),
        on: role === item.id,
      }))}
      people={list.users.map((user) => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        place: user.place,
        detail: user.detail,
        joined: when(user.createdAt),
        profile: user.profile || {},
      }))}
    />
  );
}
