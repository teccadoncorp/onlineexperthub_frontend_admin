export function tx(locale: string, en: string, bn: string) {
  return locale === "en" ? en : bn;
}

export const STATUS_LABEL: Record<string, [string, string]> = {
  DRAFT: ["Draft", "খসড়া"],
  SUBMITTED: ["Submitted", "জমা হয়েছে"],
  AWAITING_PAYMENT: ["Waiting for UPI", "ইউপিআই বাকি"],
  EXPERT_ACCEPTED: ["Expert is working", "বিশেষজ্ঞ কাজ করছেন"],
  DOCUMENTS_QUERIED: ["Document needed", "কাগজ লাগবে"],
  FILED: ["Filed on official portal", "সরকারি পোর্টালে জমা"],
  ACK_UPLOADED: ["Acknowledgement ready", "স্বীকৃতি এসেছে"],
  CLOSED: ["Closed", "বন্ধ"],
  DECLINED: ["Expert declined", "বিশেষজ্ঞ রাজি হননি"],
  CANCELLED: ["Cancelled", "বাতিল"],
  DISPUTED: ["Disputed", "অভিযোগ"],
};

export function statusLabel(locale: string, status: string) {
  const pair = STATUS_LABEL[status];
  if (!pair) return status;
  return locale === "en" ? pair[0] : pair[1];
}

const EVENT_LABEL: Record<string, [string, string]> = {
  created: ["Created the request", "অনুরোধ তৈরি"],
  offered: ["Offered to an expert", "বিশেষজ্ঞকে অফার"],
  accepted: ["Accepted the request", "অনুরোধ গ্রহণ"],
  declined: ["Declined the request", "অনুরোধ প্রত্যাখ্যান"],
  queried: ["Asked for a document", "কাগজ চেয়েছে"],
  file_added: ["Added a document", "কাগজ যোগ"],
  field_added: ["Added a field", "ফিল্ড যোগ"],
  filed: ["Filed on the official portal", "সরকারি পোর্টালে জমা"],
  ack: ["Uploaded the acknowledgement", "স্বীকৃতি আপলোড"],
  closed: ["Closed the request", "অনুরোধ বন্ধ"],
  disputed: ["Opened a dispute", "অভিযোগ খুলেছে"],
  paid: ["Recorded the payment", "পেমেন্ট লিখেছে"],
  assigned: ["Assigned an expert", "বিশেষজ্ঞ দিয়েছে"],
};

export function eventLabel(locale: string, type: string) {
  const pair = EVENT_LABEL[type];
  if (pair) return locale === "en" ? pair[0] : pair[1];
  return statusLabel(locale, type);
}

const ROLE_LABEL: Record<string, [string, string]> = {
  ADMIN: ["Admin", "অ্যাডমিন"],
  EXPERT: ["Expert", "বিশেষজ্ঞ"],
  SHOP_OWNER: ["Shop owner", "দোকানের মালিক"],
  SHOP_STAFF: ["Counter agent", "কাউন্টার এজেন্ট"],
};

export function roleLabel(locale: string, role: string) {
  const pair = ROLE_LABEL[role];
  if (!pair) return role;
  return locale === "en" ? pair[0] : pair[1];
}

export function performedBy(locale: string, name: string, role: string) {
  const who = (name || "").trim();
  const title = role ? roleLabel(locale, role) : "";
  if (who && title) return `${who} · ${title}`;
  if (who) return who;
  return tx(locale, "System", "সিস্টেম");
}
