import { InputBox, TextArea } from "@/components/ant";
import { NamedCheck } from "@/components/fields";
import { apiGet } from "@/lib/api";
import { adminPath } from "@/lib/admin";
import { tx } from "@/lib/tx";
import { saveNews } from "@/server/admin";

export default async function AdminNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = (await apiGet<{ id: string; slug: string; published: boolean }[]>(adminPath("/news"))) || [];
  return (
    <div className="loop-stack">
      <section className="loop-card" style={{ marginTop: 0 }}>
        <h2>{tx(locale, "News", "খবর")}</h2>
        <form action={saveNews} className="loop-form">
          <input type="hidden" name="locale" value={locale} />
          <label>Slug<InputBox name="slug" required /></label>
          <label>Title EN<InputBox name="titleEn" required /></label>
          <label>শিরোনাম<InputBox name="titleBn" required /></label>
          <label>Body EN<TextArea name="bodyEn" required /></label>
          <label>বিষয়<TextArea name="bodyBn" required /></label>
          <NamedCheck name="published" defaultChecked>Published</NamedCheck>
          <button className="loop-btn" type="submit">{tx(locale, "Publish", "প্রকাশ")}</button>
        </form>
      </section>
      <section className="loop-card">
        {posts.map((post) => (
          <p key={post.id} className="loop-mini">{post.slug} · {post.published ? "live" : "hidden"}</p>
        ))}
      </section>
    </div>
  );
}
