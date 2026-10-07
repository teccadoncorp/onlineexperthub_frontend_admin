import { InboxView, type DisputeRow } from "@/components/loop/inbox-view";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";

export default async function DisputesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const disputes = (await apiGet<DisputeRow[]>(adminPath("/disputes"))) || [];
  return <InboxView locale={locale} disputes={disputes} />;
}
