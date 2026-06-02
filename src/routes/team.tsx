import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgCeo, imgMtnHero } from "@/assets/images";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team · Deesire Moore Grace Foundation" },
      { name: "description", content: "Meet the leadership of DMGF — Founder & CEO Ms. Deesire Moore, Global Director Mr. Shedrick K. Nungehn, Brand Ambassador Ms. Sannah K. Ballah and the team behind our mission." },
      { property: "og:title", content: "Our Team · DMGF" },
      { property: "og:description", content: "The people leading Deesire Moore Grace Foundation." },
      { property: "og:image", content: imgCeo },
      { name: "twitter:image", content: imgCeo },
    ],
  }),
  component: Team,
});

const supporting = [
  { name: "Mr. Shedrick K. Nungehn", role: "Global Director", img: imgMtnHero, focus: "left" as const },
  { name: "Ms. Sannah K. Ballah", role: "Brand Ambassador", img: imgMtnHero, focus: "right" as const },
];

function Team() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title={<>The people behind <span className="text-gradient-gold">the mission.</span></>}
        subtitle="Compassionate leaders, dedicated staff and trusted ambassadors carrying DMGF's work across Liberia."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-elegant bg-ink">
              <img
                src={imgCeo}
                alt="Ms. Deesire Moore, Founder & CEO of DMGF"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-ink to-transparent">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Founder & CEO</div>
                <div className="font-display text-2xl text-white mt-1">Ms. Deesire Moore</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Founder & CEO</div>
              <h2 className="font-display text-4xl lg:text-5xl">Ms. Deesire Moore</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                A passionate humanitarian and visionary leader, Ms. Deesire Moore founded the Deesire Moore Grace Foundation to restore hope to vulnerable women, youth and children across Liberia. Her work blends compassion with accountability — building programs that empower communities, defend dignity and create real, measurable change.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Under her leadership, DMGF has grown into a trusted, self-supported nonprofit reaching thousands of beneficiaries through healthcare outreach, education, women empowerment and youth development.
              </p>
              <Link to="/ceo-message" className="inline-flex mt-7 items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition">
                Read CEO Message <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Leadership & Ambassadors</div>
            <h2 className="font-display text-4xl lg:text-5xl">Voices carrying the mission forward.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {supporting.map((p) => (
              <div key={p.name} className="rounded-2xl border bg-card hover-lift overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden bg-ink">
                  <img
                    src={p.img}
                    alt={p.name}
                    className={`w-full h-full object-cover ${p.focus === "left" ? "object-left" : "object-right"}`}
                    style={{ objectPosition: p.focus === "left" ? "20% center" : "80% center" }}
                  />
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-gold-deep">{p.role}</div>
                  <div className="font-display text-xl mt-1">{p.name}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Pictured together at the <span className="text-gold-deep font-medium">MTN Hero of Change 2026</span> — representing DMGF on the national stage.
          </p>
        </div>
      </section>
    </>
  );
}
