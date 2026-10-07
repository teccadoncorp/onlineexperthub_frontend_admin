import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

const API = process.env.API_URL || "http://127.0.0.1:8000";
const ACCESS = "oe_access";
const REFRESH = "oe_refresh";
const LEGACY = "oe_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-auth-secret");
}

function lifetime(token: string, fallback: number) {
  try {
    const part = token.split(".")[1] || "";
    const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    if (typeof json.exp === "number") return Math.max(0, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    // keep the fallback lifetime
  }
  return fallback;
}

function localeOf(pathname: string) {
  return pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : "en";
}

function continueWith(request: NextRequest, headers?: Headers) {
  const nextHeaders = headers ?? new Headers(request.headers);
  nextHeaders.set("x-oe-locale", localeOf(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: nextHeaders } });
}

function forwarded(request: NextRequest, access?: string, refresh?: string) {
  const rows = request.cookies.getAll().filter((item) => item.name !== ACCESS && item.name !== REFRESH && item.name !== LEGACY);
  if (access) rows.push({ name: ACCESS, value: access });
  if (refresh) rows.push({ name: REFRESH, value: refresh });
  return rows.map((item) => `${item.name}=${item.value}`).join("; ");
}

function applyCookies(request: NextRequest, response: NextResponse, access: string | null, refresh: string | null, changed: boolean) {
  const common = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production" };
  if (changed && access && refresh) {
    response.cookies.set(ACCESS, access, { ...common, maxAge: lifetime(access, 15 * 60) });
    response.cookies.set(REFRESH, refresh, { ...common, maxAge: lifetime(refresh, 60 * 60 * 24 * 30) });
  } else if (changed) {
    response.cookies.set(ACCESS, "", { ...common, maxAge: 0 });
    response.cookies.set(REFRESH, "", { ...common, maxAge: 0 });
  }
  if (request.cookies.get(LEGACY)) response.cookies.set(LEGACY, "", { ...common, maxAge: 0 });
  return response;
}

function route(request: NextRequest, access: string | null, refresh: string | null, changed: boolean) {
  const page = !request.nextUrl.pathname.startsWith("/api");
  let current = request;
  if (changed) {
    const headers = new Headers(request.headers);
    headers.set("cookie", forwarded(request, access || undefined, refresh || undefined));
    current = new NextRequest(request.url, { headers, method: request.method });
  }
  const response = page ? handleI18n(current) : continueWith(current);
  return applyCookies(request, response, access, refresh, changed);
}

function isLogin(pathname: string) {
  return pathname === "/login" || pathname === "/bn/login" || pathname === "/en/login";
}

function desk(request: NextRequest, role: string, shopId: string, expertId: string) {
  const prefix = localeOf(request.nextUrl.pathname) === "bn" ? "/bn" : "";
  const shopOrigin = process.env.SHOP_URL || "http://localhost:3000";
  if (role === "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}/admin`;
    url.search = "";
    return url;
  }
  if ((role === "SHOP_OWNER" || role === "SHOP_STAFF") && shopId) return new URL(`${prefix}/shop`, shopOrigin);
  if (role === "EXPERT" && expertId) return new URL(`${prefix}/expert`, shopOrigin);
  return null;
}

async function claims(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "access") return null;
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    if (exp * 1000 <= Date.now() + 15_000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function check(access: string): Promise<"ok" | "stale" | "down"> {
  try {
    const response = await fetch(`${API}/v1/auth/check`, {
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    if (response.status === 401) return "stale";
    if (!response.ok) return "down";
    const data = await response.json();
    const payload = await claims(access);
    if (!payload) return "stale";
    const same =
      data.uid === payload.uid &&
      data.role === payload.role &&
      (data.shopId || "") === ((payload.shopId as string) || "") &&
      (data.expertId || "") === ((payload.expertId as string) || "");
    return same ? "ok" : "stale";
  } catch {
    return "down";
  }
}

async function renew(token: string): Promise<{ accessToken: string; refreshToken: string } | "invalid" | "down"> {
  try {
    const response = await fetch(`${API}/v1/auth/refresh`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (response.status === 401) return "invalid";
    if (!response.ok) return "down";
    const data = await response.json();
    if (!data.accessToken || !data.refreshToken) return "invalid";
    return data;
  } catch {
    return "down";
  }
}

export async function middleware(request: NextRequest) {
  const currentAccess = request.cookies.get(ACCESS)?.value || null;
  const currentRefresh = request.cookies.get(REFRESH)?.value || null;
  const legacy = request.cookies.get(LEGACY)?.value;
  let access = currentAccess;
  let refresh = currentRefresh;
  let changed = Boolean(legacy) && !access && !refresh;
  let confirmed = false;

  if (access || refresh) {
    if (access && (await claims(access))) {
      const state = await check(access);
      if (state === "ok") confirmed = true;
      else if (state === "down") confirmed = false;
      else access = null;
    } else {
      access = null;
    }
    if (!confirmed && !access) {
      if (!refresh) changed = true;
      else {
        const next = await renew(refresh);
        if (next === "down") {
          access = currentAccess;
          confirmed = false;
        } else if (next === "invalid") {
          refresh = null;
          changed = true;
        } else {
          access = next.accessToken;
          refresh = next.refreshToken;
          changed = true;
          confirmed = true;
        }
      }
    }
  }

  if (confirmed && access && isLogin(request.nextUrl.pathname)) {
    const payload = await claims(access);
    const target = payload ? desk(request, String(payload.role || ""), String(payload.shopId || ""), String(payload.expertId || "")) : null;
    if (target) return applyCookies(request, NextResponse.redirect(target), access, refresh, changed);
  }
  return route(request, access, refresh, changed);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
