import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionUser = {
  uid: string;
  role: "SHOP_OWNER" | "SHOP_STAFF" | "EXPERT" | "ADMIN";
  shopId?: string;
  expertId?: string;
  name: string;
  phone: string;
};

const API = process.env.API_URL || "http://127.0.0.1:8000";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-auth-secret");
}

function lifetime(token: string, fallback: number) {
  try {
    const part = token.split(".")[1] || "";
    const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
    const json = JSON.parse(Buffer.from(padded, "base64").toString());
    if (typeof json.exp === "number") return Math.max(0, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    // keep the fallback lifetime
  }
  return fallback;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

export async function setSessionTokens(access: string, refresh: string) {
  const jar = await cookies();
  jar.set("oe_access", access, cookieOptions(lifetime(access, 15 * 60)));
  jar.set("oe_refresh", refresh, cookieOptions(lifetime(refresh, 60 * 60 * 24 * 30)));
  jar.delete("oe_session");
}

export async function storeAuth(data: { accessToken?: string; refreshToken?: string; token?: string }) {
  const access = data.accessToken || data.token;
  if (access && data.refreshToken) await setSessionTokens(access, data.refreshToken);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("oe_access");
  jar.delete("oe_refresh");
  jar.delete("oe_session");
}

export async function revokeAndClear() {
  const jar = await cookies();
  const access = jar.get("oe_access")?.value;
  const refresh = jar.get("oe_refresh")?.value;
  if (access || refresh) {
    try {
      await fetch(`${API}/v1/auth/logout`, {
        method: "POST",
        headers: {
          ...(access ? { authorization: `Bearer ${access}` } : {}),
          ...(refresh ? { "x-refresh-token": refresh } : {}),
        },
        cache: "no-store",
      });
    } catch {
      // the browser cookies are still removed below
    }
  }
  await clearSession();
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get("oe_access")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "access" || typeof payload.uid !== "string") return null;
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
