import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "./loop.css";

const noto = Noto_Sans_Bengali({ subsets: ["bengali", "latin"], variable: "--font-noto" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700", "800"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const hinted = headerList.get("x-next-intl-locale") || headerList.get("x-oe-locale");
  const locale = hinted === "bn" ? "bn" : "en";
  return (
    <html lang={locale} className={`${sans.variable} ${noto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
