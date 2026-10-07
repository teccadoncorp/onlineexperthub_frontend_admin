import { redirect as nextRedirect } from "next/navigation";

export function localePath(locale: string, href: string) {
  const path = href.startsWith("/") ? href : `/${href}`;
  if (locale === "en") return path;
  return `/bn${path === "/" ? "" : path}`;
}

export function go(locale: string, href: string): never {
  nextRedirect(localePath(locale, href));
}
