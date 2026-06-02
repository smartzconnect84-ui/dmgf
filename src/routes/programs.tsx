import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Sparkles, Users, BookOpen, Stethoscope, GraduationCap, Home, ArrowRight } from "lucide-react";
import imgWomen from "@/assets/women-empowerment.jpg";
import imgYouth from "@/assets/youth-development.jpg";
import imgChild from "@/assets/child-welfare.jpg";
import imgHealth from "@/assets/healthcare.jpg";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs · DMGF" },
      { name: "description", content: "Women empowerment, youth development, child welfare, healthcare support, education and community rehabilitation programs across Liberia." },
      { property: "og:title", content: "DMGF Programs" },
      { property: "og:description", content: "Comprehensive programs designed for measurable, lasting transformation." },
    ],
  }),
  component: Programs,
});

const programs = [
  { icon: Sparkles, t: "Women Empowerment", img: imgWomen, items: ["Skills development", "Entrepreneurship", "Financial literacy", "Leadership training"] },
  { icon: Users, t: "Youth Development", img: imgYouth, items: ["Mentorship", "Career guidance", "Leadership development", "Employment readiness"] },
  { icon: BookOpen, t: "Child Welfare", img: imgChild, items: ["Educational aid", "Child protection", "School support", "Scholarships"] },
  { icon: Stethoscope, t: "Healthcare Support", img: imgHealth, items: ["Medical outreach", "Health awareness", "Mental health support", "Community wellness"] },
  { icon: GraduationCap, t: "Educational Support", img: imgChild, items: ["Tuition assistance", "Learning materials", "Tutoring", "Higher-education access"] },
  { icon: Home, t: "Community Rehabilitation", img: imgWomen, items: ["Community development", "Livelihood support", "Social protection", "Advocacy initiatives"] },
];

function Programs() {
  return (
    <>
      <PageHero
        eyebrow="Our Programs"
        title={<>Six pillars. <span className="text-gradient-gold">One mission.</span></>}
        subtitle="Each program is designed in partnership with the communities we serve — for transformation that lasts beyond a single grant or donation."
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 space-y-24">
          {programs.map((p, i) => (
            <div key={p.t} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
                  <img src={p.img} alt={p.t} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-gradient-gold grid place-items-center text-ink shadow-gold">
                  <p.icon className="h-12 w-12" />
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Program 0{i + 1}</div>
                <h2 className="font-display text-4xl lg:text-5xl">{p.t}</h2>
                <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                  A holistic approach combining direct support, training and long-term mentorship to ensure dignity, capacity and sustained outcomes.
                </p>
                <ul className="mt-7 grid sm:grid-cols-2 gap-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex gap-3 flex-wrap">
                  <Link to="/donate" className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full shadow-gold hover-lift font-medium">
                    Sponsor this program <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/volunteer" className="inline-flex items-center gap-2 border border-input px-6 py-3 rounded-full hover:border-gold hover:text-gold-deep transition">
                    Volunteer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
