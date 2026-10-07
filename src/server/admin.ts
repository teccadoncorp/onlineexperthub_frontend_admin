"use server";

import { apiAct } from "@/lib/api";
import { go } from "@/lib/paths";

async function run(name: string, formData: FormData) {
  const data = await apiAct(name, formData);
  const locale = String(formData.get("locale") || "en");
  if (data.redirect) go(locale, data.redirect);
}

export async function setExpertStatus(formData: FormData) {
  await run("setExpertStatus", formData);
}

export async function saveDirectoryUser(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const data = await apiAct("saveDirectoryUser", formData);
  const locale = String(formData.get("locale") || "en");
  if (data.error) return { error: data.error };
  if (data.redirect) go(locale, data.redirect);
  return { error: locale === "bn" ? "সেভ হয়নি।" : "Could not save this person." };
}

export async function saveService(formData: FormData) {
  await run("saveService", formData);
}

export async function uploadServiceImage(formData: FormData) {
  await run("uploadServiceImage", formData);
}

export async function creditShop(formData: FormData) {
  await run("creditShop", formData);
}

export async function assignRequest(formData: FormData) {
  await run("assignRequest", formData);
}

export async function updateRequestStatus(formData: FormData) {
  await run("updateRequestStatus", formData);
}

export async function addRequestFile(formData: FormData) {
  await run("addRequestFile", formData);
}

export async function addServiceField(formData: FormData) {
  await run("addServiceField", formData);
}

export async function addServiceDocument(formData: FormData) {
  await run("addServiceDocument", formData);
}

export async function saveNews(formData: FormData) {
  await run("saveNews", formData);
}

export async function saveTutorial(formData: FormData) {
  await run("saveTutorial", formData);
}

export async function resolveDispute(formData: FormData) {
  await run("resolveDispute", formData);
}

export async function runPayoutBatch(formData: FormData) {
  await run("runPayoutBatch", formData);
}

export async function markPayoutPaid(formData: FormData) {
  await run("markPayoutPaid", formData);
}

export async function runRetention(formData: FormData) {
  await run("runRetention", formData);
}
