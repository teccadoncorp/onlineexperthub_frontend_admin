"use client";

import { useActionState, useMemo, useState } from "react";
import { tx } from "@/lib/tx";
import { saveDirectoryUser } from "@/server/admin";

type PinOption = { pincode: string; district: string; area: string };

export function AddShopForm({ locale, pins, onClose }: { locale: string; pins: PinOption[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveDirectoryUser, {} as { error?: string });
  const districts = useMemo(() => [...new Set(pins.map((pin) => pin.district))], [pins]);
  const [district, setDistrict] = useState(districts[0] || "");
  const localPins = pins.filter((pin) => pin.district === district);
  return (
    <form action={action} className="loop-form loop-user-panel">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="role" value="SHOP_OWNER" />
      <input type="hidden" name="returnTo" value="/admin/experts" />
      <input type="hidden" name="plan" value="FREE" />
      <p className="loop-kicker wide">{tx(locale, "Shop", "দোকান")}</p>
      <label>
        {tx(locale, "Shop name", "দোকানের নাম")}
        <input name="shopName" required minLength={2} maxLength={80} />
      </label>
      <label>
        {tx(locale, "District", "জেলা")}
        <select name="district" value={district} onChange={(event) => setDistrict(event.target.value)}>
          {districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tx(locale, "PIN", "পিন")}
        <select key={district} name="pincode" defaultValue={localPins[0]?.pincode || ""} required>
          {localPins.map((pin) => (
            <option key={pin.pincode} value={pin.pincode}>
              {pin.pincode} — {pin.area}
            </option>
          ))}
        </select>
      </label>
      <label className="wide">
        {tx(locale, "Address", "ঠিকানা")}
        <input name="address" maxLength={200} />
      </label>
      <p className="loop-kicker wide">{tx(locale, "Owner contact and login", "মালিকের যোগাযোগ ও লগইন")}</p>
      <label>
        {tx(locale, "Owner name", "মালিকের নাম")}
        <input name="name" required minLength={2} maxLength={80} />
      </label>
      <label>
        {tx(locale, "Login mobile", "লগইন মোবাইল")}
        <input name="phone" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="9000000000" />
      </label>
      <p className="loop-sub wide">
        {tx(
          locale,
          "This mobile is the owner's contact and the shop desk login. They sign in with a one-time code sent to it.",
          "এই মোবাইল মালিকের যোগাযোগ এবং দোকান ডেস্কের লগইন। একবারের কোড দিয়ে লগইন করবেন।",
        )}
      </p>
      {state.error ? <p className="loop-alert wide">{state.error}</p> : null}
      <div className="loop-user-save wide">
        <button className="loop-btn" type="submit" disabled={pending}>
          {pending ? tx(locale, "Saving", "সেভ হচ্ছে") : tx(locale, "Create shop", "দোকান খুলুন")}
        </button>
        <button type="button" onClick={onClose}>
          {tx(locale, "Close", "বন্ধ")}
        </button>
      </div>
    </form>
  );
}
