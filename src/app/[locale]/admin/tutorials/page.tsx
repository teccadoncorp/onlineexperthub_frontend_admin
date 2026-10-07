import { InputBox, TextArea } from "@/components/ant";
import { NamedCheck } from "@/components/fields";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { tx } from "@/lib/tx";
import { saveTutorial } from "@/server/admin";

export default async function AdminTutorials({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tutorials = (await apiGet<{ id: string; slug: string }[]>(adminPath("/tutorials"))) || [];
  return (
    <div className="loop-stack">
      <section className="loop-card" style={{ marginTop: 0 }}>
        <h2>{tx(locale, "Tutorials", "টিউটোরিয়াল")}</h2>
        <form action={saveTutorial} className="loop-form">
          <input type="hidden" name="locale" value={locale} />
          <label>Slug<InputBox name="slug" required /></label>
          <label>Title EN<InputBox name="titleEn" required /></label>
          <label>শিরোনাম<InputBox name="titleBn" required /></label>
          <label>
            {tx(locale, "English steps, one per line", "ইংরেজি ধাপ, প্রতি লাইনে একটি")}
            <TextArea name="stepsEn" required />
          </label>
          <label>
            {tx(locale, "Bengali steps, one per line", "বাংলা ধাপ, প্রতি লাইনে একটি")}
            <TextArea name="stepsBn" required />
          </label>
          <label>
            {tx(locale, "Video URL", "ভিডিও লিঙ্ক")}
            <InputBox name="videoUrl" />
          </label>
          <NamedCheck name="published" defaultChecked>Published</NamedCheck>
          <button className="loop-btn" type="submit">{tx(locale, "Save tutorial", "টিউটোরিয়াল সেভ")}</button>
        </form>
      </section>
      <section className="loop-card">
        {tutorials.map((tutorial) => <p key={tutorial.id} className="loop-mini">{tutorial.slug}</p>)}
      </section>
    </div>
  );
}
