"use client";

import { Alert, Input } from "antd";
import { useActionState, useState } from "react";
import { requestOtp, verifyOtp, type AuthState } from "@/server/auth";

export function LoginForm({ locale }: { locale: string }) {
  const [phoneState, request, requesting] = useActionState(requestOtp, {} as AuthState);
  const [codeState, verify, verifying] = useActionState(verifyOtp, {} as AuthState);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [editing, setEditing] = useState(false);
  const bn = locale !== "en";
  const sent = Boolean(phoneState.phone && !phoneState.error) && !editing;

  if (!sent) {
    return (
      <form className="login-form admin" action={request} onSubmit={() => setEditing(false)}>
        <input type="hidden" name="locale" value={locale} />
        <label>
          <span>{bn ? "মোবাইল নম্বর" : "Mobile number"}</span>
          <input
            name="phone"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9000000000"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />
        </label>
        {phoneState.error ? <Alert type="error" showIcon title={phoneState.error} /> : null}
        <button className="login-submit" type="submit" disabled={requesting || phone.length !== 10}>
          {requesting ? (bn ? "পাঠানো হচ্ছে…" : "Sending…") : bn ? "কোড পাঠান" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form className="login-form admin" action={verify}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="phone" value={phoneState.phone} />
      <input type="hidden" name="code" value={code} />
      <p className="login-sent">
        {phoneState.devCode
          ? bn
            ? `টেস্টিং চলছে। এই কোড ব্যবহার করুন: ${phoneState.devCode}`
            : `Testing is on. Use this code: ${phoneState.devCode}`
          : bn
            ? `${phoneState.phone} নম্বরে কোড গেছে।`
            : `Code sent to ${phoneState.phone}.`}
        <button type="button" onClick={() => setEditing(true)}>{bn ? "নম্বর বদলান" : "Change number"}</button>
      </p>
      <label>
        <span>{bn ? "৬ সংখ্যার কোড" : "6-digit code"}</span>
        <Input.OTP length={6} value={code} onChange={setCode} inputMode="numeric" />
      </label>
      {codeState.error ? <Alert type="error" showIcon title={codeState.error} /> : null}
      <button className="login-submit" type="submit" disabled={verifying || code.length !== 6}>
        {verifying ? (bn ? "যাচাই হচ্ছে…" : "Checking…") : bn ? "লগইন" : "Log in"}
      </button>
      <button className="login-resend" type="submit" formAction={request} disabled={requesting}>
        {requesting ? (bn ? "আবার পাঠানো হচ্ছে…" : "Sending again…") : bn ? "কোড আবার পাঠান" : "Send the code again"}
      </button>
    </form>
  );
}
