import { LoopShell } from "@/components/loop/shell";
import { go } from "@/lib/paths";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session || session.role !== "ADMIN") go(locale, "/login");
  return (
    <LoopShell locale={locale} person={session.name}>
      {children}
    </LoopShell>
  );
}
