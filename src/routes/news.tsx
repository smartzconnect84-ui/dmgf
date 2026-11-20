import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgWomen, imgYouth, imgChild, imgHealth, imgAdvocacy } from "@/assets/images";
import { fetchContentBlocks, fetchNews } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/news")({
  loader: async () => {
    try { return await fetchContentBlocks({ data: { page: "news" } }); } catch { return {} as Record<string, string>; }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "News & Stories · DMGF";
    const description = cb.seo_description || "Stories, announcements and field updates from Deesire Moore Grace Foundation.";
    const ogImage = cb.seo_og_image;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
      ],
    };
  },
  component: News,
});

const posts = [
  { img: imgWomen, cat: "Women Empowerment", t: "How 50 women launched cooperatives in Bomi", d: "A year of training turned into livelihoods that now support 200+ family members." },
  { img: imgYouth, cat: "Youth Development", t: "Digital skills program graduates first cohort", d: "30 young Liberians completed our intensive digital readiness program with job placements." },
  { img: imgHealth, cat: "Healthcare", t: "Quarterly medical outreach reaches 1,200 patients", d: "Free consultations, screenings and medication across three rural communities." },
  { img: imgChild, cat: "Education", t: "Back-to-school drive equips 800 children", d: "Books, uniforms and supplies distributed at the start of the academic year." },
  { img: imgAdvocacy, cat: "Advocacy", t: "Say No To Drugs march reaches thousands", d: "DMGF volunteers led a powerful awareness walk against substance abuse in Monrovia." },
  { img: imgChild, cat: "Announcements", t: "DMGF opens new community center in Congo Town", d: "A permanent space for training, counseling and after-school programs." },
];

function News() {
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "news"], queryFn: () => fetchContentBlocks({ data: { page: "news" } }) });
  const { data: dbNews } = useQuery({ queryKey: ["pub", "news"], queryFn: () => fetchNews() });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const posts = (dbNews && dbNews.length)
    ? dbNews.map((p: any) => ({ img: p.image_url || imgWomen, cat: p.category || "News", t: p.title, d: p.excerpt || p.body || "" }))
    : [
        { img: imgWomen, cat: "Women Empowerment", t: "How 50 women launched cooperatives in Bomi", d: "A year of training turned into livelihoods that now support 200+ family members." },
        { img: imgYouth, cat: "Youth Development", t: "Digital skills program graduates first cohort", d: "30 young Liberians completed our intensive digital readiness program with job placements." },
        { img: imgHealth, cat: "Healthcare", t: "Quarterly medical outreach reaches 1,200 patients", d: "Free consultations, screenings and medication across three rural communities." },
        { img: imgChild, cat: "Education", t: "Back-to-school drive equips 800 children", d: "Books, uniforms and supplies distributed at the start of the academic year." },
        { img: imgAdvocacy, cat: "Advocacy", t: "Say No To Drugs march reaches thousands", d: "DMGF volunteers led a powerful awareness walk against substance abuse in Monrovia." },
        { img: imgChild, cat: "Announcements", t: "DMGF opens new community center in Congo Town", d: "A permanent space for training, counseling and after-school programs." },
      ];
  return (
    <>
      <PageHero
        eyebrow="News & Stories"
        title={t("intro_heading", "From the field.") as any}
        subtitle={t("intro_body", "Real updates from our programs, our partners and the communities we walk beside.")}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.t} className="rounded-3xl overflow-hidden border bg-card hover-lift">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.t} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{p.cat}</div>
                <h3 className="font-display text-xl mt-2">{p.t}</h3>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{p.d}</p>
                <button className="mt-5 text-sm text-gold-deep">Read more →</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
