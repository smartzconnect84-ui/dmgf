import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Counter } from "@/components/Counter";
import { TrendingUp, MapPin, FileText } from "lucide-react";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact · DMGF" },
      { name: "description", content: "Live impact dashboard, annual reports, beneficiaries reached and communities served by Deesire Moore Grace Foundation." },
      { property: "og:title", content: "Our Impact" },
      { property: "og:description", content: "Real numbers. Real lives. Real change across Liberia." },
    ],
  }),
  component: Impact,
});

const big = [
  { v: 12500, s: "+", l: "Lives Impacted" },
  { v: 2400, s: "+", l: "Women Empowered" },
  { v: 1800, s: "+", l: "Youth Trained" },
  { v: 3600, s: "+", l: "Children Supported" },
];

const breakdown = [
  { l: "Educational support provided", v: "4,200+ learners" },
  { l: "Healthcare interventions", v: "1,750 patients" },
  { l: "Communities served", v: "48 communities" },
  { l: "Projects completed", v: "62 projects" },
  { l: "Volunteer hours", v: "9,400 hrs" },
  { l: "Scholarships awarded", v: "180 students" },
];

const reports = [
  { y: "2024", t: "Annual Impact Report", d: "A year of expanded outreach and deeper partnerships." },
  { y: "2023", t: "Annual Impact Report", d: "Healthcare and education milestones across 4 counties." },
  { y: "2022", t: "Foundational Year", d: "DMGF's first year of registered operations." },
];

function Impact() {
  return (
    <>
      <PageHero
        eyebrow="Impact Dashboard"
        title={<>Numbers that mean <span className="text-gradient-gold">real lives.</span></>}
        subtitle="Every percentage point, every counter, every figure on this page represents a person — a story changed because someone chose to act."
      />

      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden shadow-elegant">
            {big.map((s) => (
              <div key={s.l} className="bg-white p-8 lg:p-12 text-center">
                <div className="font-display text-5xl lg:text-7xl">
                  <Counter to={s.v} suffix={s.s} />
                </div>
                <div className="mt-3 mx-auto h-px w-10 bg-gold" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-14">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">By the numbers</div>
            <h2 className="font-display text-4xl lg:text-5xl mb-8">A breakdown of measurable change.</h2>
            <ul className="space-y-4">
              {breakdown.map((b) => (
                <li key={b.l} className="flex items-center justify-between border-b pb-4">
                  <span className="text-muted-foreground">{b.l}</span>
                  <span className="font-display text-xl">{b.v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-ink text-white p-10 shadow-elegant">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
            <TrendingUp className="h-10 w-10 text-gold" />
            <h3 className="font-display text-3xl mt-5">Where the money goes</h3>
            <div className="mt-8 space-y-5">
              {[
                { l: "Direct program delivery", p: 78 },
                { l: "Community outreach", p: 12 },
                { l: "Administration", p: 7 },
                { l: "Fundraising", p: 3 },
              ].map((row) => (
                <div key={row.l}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">{row.l}</span>
                    <span className="text-gold">{row.p}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-gold" style={{ width: `${row.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Reports & Accountability</div>
              <h2 className="font-display text-4xl lg:text-5xl">Transparent. Audited. Public.</h2>
            </div>
            <MapPin className="h-10 w-10 text-gold" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reports.map((r) => (
              <a key={r.y} href="#" className="glass rounded-2xl p-7 hover-lift block">
                <FileText className="h-8 w-8 text-gold mb-5" />
                <div className="text-xs uppercase tracking-[0.2em] text-gold">{r.y}</div>
                <div className="font-display text-2xl mt-2">{r.t}</div>
                <p className="text-sm text-white/65 mt-3">{r.d}</p>
                <div className="mt-5 text-sm text-gold">Download PDF →</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
