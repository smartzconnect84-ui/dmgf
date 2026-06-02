import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import imgWomen from "@/assets/women-empowerment.jpg";
import imgYouth from "@/assets/youth-development.jpg";
import imgChild from "@/assets/child-welfare.jpg";
import imgHealth from "@/assets/healthcare.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Stories · DMGF" },
      { name: "description", content: "Stories, announcements and field updates from Deesire Moore Grace Foundation." },
      { property: "og:title", content: "DMGF News & Stories" },
      { property: "og:description", content: "Read the latest from the field." },
    ],
  }),
  component: News,
});

const posts = [
  { img: imgWomen, cat: "Women Empowerment", t: "How 50 women launched cooperatives in Bomi", d: "A year of training turned into livelihoods that now support 200+ family members." },
  { img: imgYouth, cat: "Youth Development", t: "Digital skills program graduates first cohort", d: "30 young Liberians completed our intensive digital readiness program with job placements." },
  { img: imgHealth, cat: "Healthcare", t: "Quarterly medical outreach reaches 1,200 patients", d: "Free consultations, screenings and medication across three rural communities." },
  { img: imgChild, cat: "Education", t: "Back-to-school drive equips 800 children", d: "Books, uniforms and supplies distributed at the start of the academic year." },
  { img: imgWomen, cat: "Advocacy", t: "Mental health awareness comes to Sinkor", d: "A community walk and panel sparked open conversations on stigma and care." },
  { img: imgChild, cat: "Announcements", t: "DMGF opens new community center in Congo Town", d: "A permanent space for training, counseling and after-school programs." },
];

function News() {
  return (
    <>
      <PageHero
        eyebrow="News & Stories"
        title={<>From the <span className="text-gradient-gold">field.</span></>}
        subtitle="Real updates from our programs, our partners and the communities we walk beside."
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
