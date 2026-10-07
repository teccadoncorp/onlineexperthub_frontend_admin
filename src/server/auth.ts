"use server";

import { apiAct } from "@/lib/api";
import { go } from "@/lib/paths";
import { getSession, revokeAndClear, storeAuth } from "@/lib/session";

export type AuthState = { error?: string; devCode?: string; phone?: string };

async function run(name: string, formData: FormData): Promise<AuthState> {
  const data = await apiAct(name, formData);
  const locale = String(formData.get("locale") || "en");
  await storeAuth(data);
  if (data.redirect) go(locale, data.redirect);
  return { error: data.error, phone: data.phone, devCode: data.devCode };
}

export async function requestOtp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  return run("requestOtp", formData);
}

export async function verifyOtp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  return run("verifyOtp", formData);
}

export async function registerAccount(_prev: AuthState, formData: FormData): Promise<AuthState> {
  return run("registerAccount", formData);
}

export async function logout(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await revokeAndClear();
  go(locale, "/login");
}

export async function currentSession() {
  return getSession();
}
