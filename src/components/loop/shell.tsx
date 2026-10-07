import { localePath } from "@/lib/paths";
import { logout } from "@/server/auth";
import { tx } from "@/lib/tx";
import { LoopNav } from "./nav";
import { StudioMenu } from "./studio-menu";

export function LoopShell({
  locale,
  person,
  children,
}: {
  locale: string;
  person: string;
  children: React.ReactNode;
}) {
  const other = locale === "en" ? "bn" : "en";
  const links = [
    { href: "/admin", label: tx(locale, "Overview", "সারাংশ") },
    { href: "/admin/ledger", label: tx(locale, "Ledger", "খতিয়ান") },
    { href: "/admin/requests", label: tx(locale, "Requests", "অনুরোধ") },
    { href: "/admin/activity", label: tx(locale, "Activity", "কার্যক্রম") },
    { href: "/admin/experts", label: tx(locale, "Clients", "ক্লায়েন্ট") },
    { href: "/admin/services", label: tx(locale, "Projects", "প্রকল্প") },
    { href: "/admin/disputes", label: tx(locale, "Inbox", "ইনবক্স") },
    { href: "/admin/analytics", label: tx(locale, "Analytics", "বিশ্লেষণ") },
  ];
  return (
    <div className="loop-stage">
      <div className="loop-window">
        <header className="loop-top">
          <div className="loop-brandrow">
            <a className="loop-brand" href={localePath(locale, "/admin")}>
              <span className="loop-mark" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    d="M8.2 15.2c-1.8 0-3.2-1.3-3.2-3.2S6.4 8.8 8.2 8.8c2.4 0 3 3.2 6 3.2 1.8 0 3.2 1.3 3.2 3.2s-1.4 3.2-3.2 3.2c-2.4 0-3-3.2-6-3.2z"
                  />
                </svg>
              </span>
              <strong>onlineexpert</strong>
            </a>
            <span className="loop-orbs" aria-hidden>
              <i className="shop" />
              <i className="expert" />
              <i className="order" />
            </span>
            <StudioMenu locale={locale} />
          </div>
          <LoopNav locale={locale} links={links} />
          <div className="loop-tools">
            <a className="loop-tool" href={localePath(other, "/admin")}>
              {locale === "en" ? "বাংলা" : "EN"}
            </a>
            <span className="loop-avatar" aria-hidden>
              {person.slice(0, 1).toUpperCase()}
              <i />
            </span>
            <span className="loop-person">{person}</span>
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit">{tx(locale, "Log out", "লগআউট")}</button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
