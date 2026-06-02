import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, HandHeart, Sparkles, Users, GraduationCap, Stethoscope, Home as HomeIcon, BookOpen, Quote, ArrowUpRight } from "lucide-react";
import hero from "@/assets/hero-community.jpg";
import imgWomen from "@/assets/women-empowerment.jpg";
import imgYouth from "@/assets/youth-development.jpg";
import imgChild from "@/assets/child-welfare.jpg";
import imgHealth from "@/assets/healthcare.jpg";
import { Counter } from "@/components/Counter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DMGF · Giving Hope. Empowering Communities. Transforming Lives." },
      { name: "description", content: "Deesire Moore Grace Foundation — a Liberian nonprofit empowering women, youth and children through education, healthcare, livelihoods and advocacy." },
      { property: "og:title", content: "Deesire Moore Grace Foundation" },
      { property: "og:description", content: "Giving Hope. Empowering Communities. Transforming Lives." },
    ],
  }),
  component: Home,
});

const stats = [
  { label: "Lives Impacted", value: 12500, suffix: "+" },
  { label: "Women Empowered", value: 2400, suffix: "+" },
  { label: "Youth Trained", value: 1800, suffix: "+" },
  { label: "Children Supported", value: 3600, suffix: "+" },
  { label: "Communities Reached", value: 48, suffix: "" },
  { label: "Volunteers Engaged", value: 320, suffix: "+" },
];

const programs = [
  { title: "Women Empowerment", desc: "Skills, entrepreneurship, financial literacy and leadership for women across Liberia.", img: imgWomen, icon: Sparkles, to: "/programs" },
  { title: "Youth Development", desc: "Mentorship, career guidance and employment readiness for the next generation of leaders.", img: imgYouth, icon: Users, to: "/programs" },
  { title: "Child Welfare", desc: "Educational aid, scholarships, school support and child protection initiatives.", img: imgChild, icon: BookOpen, to: "/programs" },
  { title: "Healthcare Support", desc: "Medical outreach, mental health support and community wellness programs.", img: imgHealth, icon: Stethoscope, to: "/programs" },
  { title: "Educational Support", desc: "Books, supplies, tuition and scholarships for vulnerable learners.", img: imgChild, icon: GraduationCap, to: "/programs" },
  { title: "Community Rehabilitation", desc: "Livelihoods, social protection and advocacy for thriving communities.", img: imgWomen, icon: Home, to: "/programs" },
];

const stories = [
  { name: "Mariama K.", role: "Entrepreneur, Bomi County", quote: "DMGF gave me the training and seed funding to open my tailoring shop. Today I employ three other women from my community." },
  { name: "Joseph T.", role: "Youth Graduate, Monrovia", quote: "Through the youth program I learned digital skills and now work as a junior IT technician. My family's life has changed." },
  { name: "Nurse Ruth", role: "Healthcare Partner", quote: "Their medical outreach has reached villages no other organisation visits. The compassion is real and consistent." },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-ink text-white">
        <img src={hero} alt="DMGF community in Liberia" className="absolute inset-0 h-full w-full object-cover opacity-65" width={1920} height={1280} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl w-full px-5 lg:px-10 pb-20 pt-40 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[11px] uppercase tracking-[0.28em] text-gold mb-7 reveal">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Monrovia · Liberia · Est. Foundation
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl leading-[0.95] reveal-up">
              Giving <span className="shimmer-gold">Hope.</span><br />
              Empowering <span className="italic font-normal">Communities.</span><br />
              Transforming <span className="text-gradient-gold">Lives.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-white/75 max-w-2xl reveal-up">
              Every child deserves a future. Every woman deserves an opportunity.
              Every youth deserves hope. Together, we can transform lives across Liberia and beyond.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 reveal-up">
              <Link to="/donate" className="group inline-flex items-center gap-3 bg-gradient-gold text-ink font-medium px-7 py-4 rounded-full shadow-gold hover-lift">
                <Heart className="h-5 w-5" /> Donate Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/volunteer" className="inline-flex items-center gap-3 border border-gold/50 text-white px-7 py-4 rounded-full hover:bg-gold/10 transition">
                <HandHeart className="h-5 w-5 text-gold" /> Become a Volunteer
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/40 animate-float">
          Scroll
        </div>
      </section>

      {/* MISSION STRIP */}
      <section className="bg-ink text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 gold-divider" />
        <div className="mx-auto max-w-5xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-5">Our Promise</div>
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-snug">
            "Every child deserves a future. Every woman deserves an opportunity.
            Every youth deserves hope. <span className="text-gradient-gold">Together, we transform lives.</span>"
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 gold-divider" />
      </section>

      {/* IMPACT COUNTERS */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Measured Impact</div>
              <h2 className="font-display text-4xl lg:text-5xl">A foundation built on results.</h2>
            </div>
            <Link to="/impact" className="inline-flex items-center gap-2 text-sm font-medium hover:text-gold-deep">
              View full impact report <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-elegant">
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-8 lg:p-10">
                <div className="font-display text-4xl lg:text-6xl text-ink">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 h-px w-10 bg-gold" />
                <div className="mt-3 text-sm uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">What We Do</div>
            <h2 className="font-display text-4xl lg:text-6xl">
              Programs that <span className="italic">restore dignity</span> and unlock potential.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((p) => (
              <Link key={p.title} to={p.to} className="group relative rounded-3xl overflow-hidden bg-ink text-white hover-lift">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-10 w-10 rounded-full bg-gradient-gold text-ink grid place-items-center">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Program</span>
                  </div>
                  <h3 className="font-display text-2xl">{p.title}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-gold">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="py-24 lg:py-32 bg-ink text-white relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gold/5 blur-3xl" />
        <div className="mx-auto max-w-7xl px-5 lg:px-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Success Stories</div>
            <h2 className="font-display text-4xl lg:text-6xl">Transformation, in their own words.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {stories.map((s) => (
              <figure key={s.name} className="glass rounded-3xl p-8 hover-lift">
                <Quote className="h-8 w-8 text-gold mb-5" />
                <blockquote className="text-white/85 leading-relaxed">"{s.quote}"</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-white/10">
                  <div className="font-display text-lg">{s.name}</div>
                  <div className="text-xs text-gold/80 uppercase tracking-wider mt-1">{s.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* DONATE CTA */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="mx-auto max-w-6xl px-5 lg:px-10">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-ink p-10 lg:p-16 shadow-elegant">
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-gold/20 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-[300px] h-[300px] rounded-full bg-gold/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4">Your Gift, Their Future</div>
                <h2 className="font-display text-4xl lg:text-6xl text-white">
                  Be the reason someone <span className="text-gradient-gold">hopes again.</span>
                </h2>
                <p className="mt-6 text-white/70 max-w-lg">
                  100% of donations go directly to programs. Every dollar feeds, teaches, heals and lifts another life in Liberia.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { amt: "$25", lbl: "School supplies" },
                  { amt: "$50", lbl: "Healthcare support" },
                  { amt: "$100", lbl: "Youth development" },
                  { amt: "$250", lbl: "Community projects" },
                ].map((d) => (
                  <div key={d.amt} className="glass rounded-2xl p-5 text-white hover-lift">
                    <div className="font-display text-3xl text-gradient-gold">{d.amt}</div>
                    <div className="text-xs text-white/70 mt-1">{d.lbl}</div>
                  </div>
                ))}
                <Link to="/donate" className="col-span-2 inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-4 rounded-2xl shadow-gold hover-lift">
                  <Heart className="h-5 w-5" /> Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pb-10">
        <div className="mx-auto max-w-4xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Stay Connected</div>
          <h2 className="font-display text-3xl lg:text-4xl">Follow our journey of transformation.</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your.email@example.com"
              className="flex-1 rounded-full border border-input bg-white px-6 py-3.5 text-sm outline-none focus:border-gold"
              aria-label="Email address"
            />
            <button className="rounded-full bg-ink text-white px-6 py-3.5 text-sm font-medium hover:bg-gold hover:text-ink transition">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
