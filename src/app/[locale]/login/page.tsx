import { LoginForm } from "@/components/login-form";
import { localePath } from "@/lib/paths";
import { tx } from "@/lib/tx";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const other = locale === "en" ? "bn" : "en";
  return (
    <main className="login-screen">
      <section className="login-visual">
        <img src="/login/counter.jpg" alt="" />
        <div className="login-shade">
          <p className="login-brand">onlineexpert.in</p>
          <blockquote>
            <p>{tx(locale, "Keep the book honest. Verify the expert before the file moves.", "খাতা সৎ রাখুন। ফাইল এগোবার আগে বিশেষজ্ঞকে যাচাই করুন।")}</p>
            <cite>{tx(locale, "Control room for shops, experts, and payouts.", "দোকান, বিশেষজ্ঞ ও পেআউটের কন্ট্রোল রুম।")}</cite>
          </blockquote>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-tools">
          <a href={localePath(other, "/login")}>{locale === "en" ? "বাংলা" : "English"}</a>
        </div>
        <div className="login-card">
          <p className="login-kicker">{tx(locale, "Admin desk", "অ্যাডমিন ডেস্ক")}</p>
          <h1>{tx(locale, "Log in", "লগইন")}</h1>
          <p className="login-lead">{tx(locale, "Enter the admin mobile. The code appears after it is sent.", "অ্যাডমিন মোবাইল দিন। কোড পাঠানোর পর ঘর খুলবে।")}</p>
          <LoginForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
