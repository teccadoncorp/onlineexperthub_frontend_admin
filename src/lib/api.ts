import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.API_URL || "http://127.0.0.1:8000";

const DATE_KEY = /At$|^(respondBy|weekStart)$/;

function revive(key: string, value: unknown) {
  if (typeof value === "string" && DATE_KEY.test(key) && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return value;
}

async function token() {
  const jar = await cookies();
  return jar.get("oe_access")?.value;
}

export type ActionResult = {
  error?: string;
  redirect?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  clear?: boolean;
  phone?: string;
  devCode?: string;
};

export async function apiGet<T>(path: string): Promise<T | null> {
  const session = await token();
  const response = await fetch(`${API}${path}`, {
    headers: session ? { authorization: `Bearer ${session}` } : {},
    cache: "no-store",
  });
  if (response.status === 401) redirect("/login");
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await response.text());
  return JSON.parse(await response.text(), revive) as T;
}

export async function apiAct(name: string, formData: FormData): Promise<ActionResult> {
  const session = await token();
  const body = new FormData();
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const bytes = Buffer.from(await value.arrayBuffer());
      body.append(key, new Blob([bytes], { type: value.type || "application/octet-stream" }), value.name || "upload");
    } else {
      body.append(key, value);
    }
  }
  const response = await fetch(`${API}/v1/actions/${name}`, {
    method: "POST",
    headers: session ? { authorization: `Bearer ${session}` } : {},
    body,
    cache: "no-store",
  });
  return (await response.json()) as ActionResult;
}

export async function apiSend(path: string, method: "POST" | "PUT", payload: string) {
  const session = await token();
  return fetch(`${API}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(session ? { authorization: `Bearer ${session}` } : {}),
    },
    body: payload,
    cache: "no-store",
  });
}
