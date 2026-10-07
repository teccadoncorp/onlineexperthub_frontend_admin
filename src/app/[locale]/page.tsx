import { go } from "@/lib/paths";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  go(locale, "/admin");
}
