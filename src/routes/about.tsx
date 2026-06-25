import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ShieldCheck, Eye, Scale, HeartHandshake, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Deesire Moore Grace Foundation" },
      { name: "description", content: "Who we are: a legally registered Liberian nonprofit dedicated to empowering women, youth and children through compassion, integrity and accountability." },
      { property: "og:title", content: "About DMGF" },
      { property: "og:description", content: "Our story, mission, vision and values." },
    ],
  }),
  component: About,
});

const values = [
  { icon: ShieldCheck, t: "Integrity", d: "We act with honesty in every interaction and every decision." },
  { icon: Scale, t: "Accountability", d: "We are responsible for our promises, our funds and our impact." },
  { icon: Eye, t: "Transparency", d: "Our work, our finances and our outcomes are open to all." },
  { icon: HeartHandshake, t: "Respect", d: "We honor the dignity of every person we serve and walk beside." },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About the Foundation"
        title={<>We exist to <span className="text-gradient-gold">restore hope.</span></>}
        subtitle="A legally registered, self-supported nonprofit headquartered in Monrovia, Liberia — dedicated to empowering women, youth and children."
      />

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Our Story</div>
            <h2 className="font-display text-4xl lg:text-5xl mb-6">Born from love. Built for impact.</h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Deesire Moore Grace Foundation (DMGF) is a legally registered self-supported nonprofit organization dedicated to giving hope and empowering women, youth and children through impactful community initiatives and sustainable development programs.
              </p>
              <p>
                From our headquarters in Congo Town — opposite the EJS Ministerial Complex in Monrovia — our team reaches across Liberia with charity, rehabilitation, healthcare, psychosocial support, educational aid and advocacy.
              </p>
              <p>
                We believe transformation is built one life, one family, one community at a time — with integrity, accountability and grace.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl bg-ink text-white p-10 shadow-elegant">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Our Mission</div>
              <p className="font-display text-2xl leading-snug">
                To empower and impact vulnerable and less-fortunate individuals and communities through comprehensive charity, rehabilitation, healthcare, psychosocial support, educational aid, and advocacy.
              </p>
            </div>
            <div className="rounded-3xl bg-gradient-gold text-ink p-10 shadow-gold">
              <div className="text-[11px] uppercase tracking-[0.3em] mb-3">Our Vision</div>
              <p className="font-display text-2xl leading-snug">
                Thriving communities where every woman, youth and child has access to opportunities, dignity, support, education, healthcare and hope for a brighter future.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Core Values</div>
            <h2 className="font-display text-4xl lg:text-5xl">The principles that guide every step.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.t} className="glass rounded-2xl p-8 hover-lift">
                <span className="h-12 w-12 grid place-items-center rounded-full bg-gradient-gold text-ink">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl mt-5">{v.t}</h3>
                <p className="text-sm text-white/65 mt-2">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Leadership</div>
            <h2 className="font-display text-4xl lg:text-5xl">Guided by experienced, compassionate leaders.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Founder & Executive Director", "Programs Director", "Finance & Operations", "Community Partnerships"].map((role) => (
              <div key={role} className="rounded-2xl border bg-card hover-lift overflow-hidden">
                <div className="aspect-[4/5] bg-gradient-to-br from-gold-soft/60 to-ink/80 relative">
                  <div className="absolute inset-0 grid place-items-center text-white/40 font-display text-6xl">DMGF</div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">DMGF Team</div>
                  <div className="font-display text-lg mt-1">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-10">
          <div className="rounded-3xl border bg-cream p-10 lg:p-14 text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Transparency & Accountability</div>
            <h2 className="font-display text-3xl lg:text-4xl">Open books. Open hearts.</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We publish annual impact reports, audited financials and program updates so every supporter sees exactly how their generosity becomes change.
            </p>
            <Link to="/programs" className="inline-flex mt-7 items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition">
              Explore Our Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
