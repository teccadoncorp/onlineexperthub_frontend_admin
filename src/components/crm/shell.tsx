import { localePath } from "@/lib/paths";
import { logout } from "@/server/auth";
import { tx } from "@/lib/tx";
import { CrmNav } from "./nav";

export function CrmShell({
  locale,
  person,
  links,
  children,
}: {
  locale: string;
  person: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const other = locale === "en" ? "bn" : "en";
  return (
    <div className="crm-app">
      <aside className="crm-side no-print">
        <a className="crm-brand" href={localePath(locale, "/admin")}>
          <strong>onlineexpert</strong>
          <span>{tx(locale, "Control room", "কন্ট্রোল রুম")}</span>
        </a>
        <CrmNav locale={locale} links={links} />
      </aside>
      <div className="crm-main">
        <header className="crm-top no-print">
          <strong>{tx(locale, "Operations", "অপারেশন")}</strong>
          <div className="crm-person">
            <a href={localePath(other, "/admin")}>{locale === "en" ? "বাংলা" : "English"}</a>
            <span className="avatar" aria-hidden>{person.slice(0, 1).toUpperCase()}</span>
            <span>{person}</span>
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit">{tx(locale, "Log out", "লগআউট")}</button>
            </form>
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </div>
    </div>
  );
}
