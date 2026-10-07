import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { tx } from "@/lib/tx";

export default async function CoveragePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const coverage = await apiGet<{
    pins: { pincode: string; district: string; pilot: boolean }[];
    shops: { district: string }[];
    experts: { district: string; pincodes: string[] }[];
  }>(adminPath("/coverage"));
  const pins = coverage?.pins || [];
  const shops = coverage?.shops || [];
  const experts = coverage?.experts || [];
  const rows = [...new Set(pins.map((pin) => pin.district))].sort().map((district) => {
    const districtPins = pins.filter((pin) => pin.district === district);
    return {
      district,
      pins: districtPins.length,
      pilot: districtPins.some((pin) => pin.pilot) ? tx(locale, "Yes", "হ্যাঁ") : tx(locale, "Statewide", "সারা রাজ্য"),
      shops: shops.filter((shop) => shop.district === district).length,
      experts: experts.filter((expert) => expert.district === district || expert.pincodes.some((pin) => districtPins.some((row) => row.pincode === pin))).length,
    };
  });
  return (
    <section className="loop-card loop-cover" style={{ marginTop: 0 }}>
      <h2>{tx(locale, "PIN and district coverage", "পিন ও জেলা কভারেজ")}</h2>
      <div className="loop-table" style={{ marginTop: 12 }}>
        <div className="loop-thead">
          <span>{tx(locale, "District", "জেলা")}</span>
          <span>{tx(locale, "PINs", "পিন")}</span>
          <span>{tx(locale, "Pilot", "পাইলট")}</span>
          <span>{tx(locale, "Shops", "দোকান")}</span>
          <span>{tx(locale, "Experts", "বিশেষজ্ঞ")}</span>
        </div>
        {rows.map((row) => (
          <div key={row.district} className="loop-row" style={{ cursor: "default" }}>
            <strong>{row.district}</strong>
            <span>{row.pins}</span>
            <span>{row.pilot}</span>
            <span>{row.shops}</span>
            <span>{row.experts}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
