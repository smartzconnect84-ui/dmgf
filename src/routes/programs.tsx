import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { fetchContentBlocks, fetchPrograms } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Users,
  BookOpen,
  Stethoscope,
  GraduationCap,
  Home,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";
import { imgWomen, imgYouth, imgChild, imgHealth, imgAdvocacy, imgSchool } from "@/assets/images";
import womenGrant3rdSrc from "@/assets/flyers/women-grant-3rd-v2.jpg";
const womenGrant3rd = { url: womenGrant3rdSrc };
import backToSchoolSrc from "@/assets/flyers/back-to-school.jpg";
const backToSchool = { url: backToSchoolSrc };
import africanChildSrc from "@/assets/flyers/african-child.jpg";
const africanChild = { url: africanChildSrc };
import breastCancerSrc from "@/assets/flyers/breast-cancer.jpg";
const breastCancer = { url: breastCancerSrc };
import antiCorruptionSrc from "@/assets/flyers/anti-corruption.jpg";
const antiCorruption = { url: antiCorruptionSrc };
import drugAwarenessSrc from "@/assets/flyers/drug-awareness.jpg";
const drugAwareness = { url: drugAwarenessSrc };

// Pillar visuals use real field photography (distinct from the campaign flyers below).
const imgEducation = imgSchool;

const campaigns = [
  {
    program: "Women Empowerment",
    img: womenGrant3rd.url,
    title: "Women's Empowerment Grant — 3rd Edition Ceremony",
    tag: "Grant Award & Certification",
    date: "Dec 17, 2025 · 2–4 PM",
    location: "MVTC Theater, Japan Freeway",
    summary:
      "One featured flyer for the women empowerment pillar, celebrating grant winners and certification for women building stronger livelihoods.",
  },
  {
    program: "Youth Development",
    img: drugAwareness.url,
    title: "Drug Abuse Awareness & Prevention Campaign",
    tag: "Choose Life, Not Harmful Drugs",
    date: "Aug 4, 2024",
    location: "Monrovia, Liberia",
    summary:
      "One featured flyer for youth development, mobilizing young people and rising-star ambassadors to choose life over harmful substances.",
  },
  {
    program: "Child Welfare",
    img: backToSchool.url,
    title: "Back to School · School Supplies Drive",
    tag: "Live Music · Dance · Drama & Food",
    date: "September 19, 2025 · 11AM–2PM",
    location: "ELWA Community, Paynesville City, Monrovia",
    summary:
      "One featured flyer for child welfare, helping children begin the academic year with school supplies and community support.",
  },
  {
    program: "Healthcare Support",
    img: breastCancer.url,
    title: "Breast Cancer Campaign 2025",
    tag: "Every Story is Unique, Every Journey Matters",
    date: "October 30–31, 2025",
    location: "DMGF · 540 Junction · Montserrado & Grand Bassa",
    summary:
      "One featured flyer for healthcare support, taking breast-cancer awareness and early-detection education into communities.",
  },
  {
    program: "Educational Support",
    img: africanChild.url,
    title: "Day of an African Child",
    tag: "Planning & Budgeting for Children's Rights",
    date: "June 16, 2025",
    location: "Liberia",
    summary:
      "One featured flyer for educational support, advocating for sustained investment in every child's future.",
  },
  {
    program: "Community Rehabilitation",
    img: antiCorruption.url,
    title: "Anti-Corruption & Human Rights Campaign",
    tag: "Transparency · Accountability · Rights",
    date: "August 30–31, 2024",
    location: "CEIO & Intellectual Bureau · Rally-Time Mkt · Live Radio Appearance",
    summary:
      "One featured flyer for community rehabilitation and advocacy, championing transparency, accountability and human rights.",
  },
];

export const Route = createFileRoute("/programs")({
  loader: async () => {
    try {
      return await fetchContentBlocks({ data: { page: "programs" } });
    } catch {
      return {} as Record<string, string>;
    }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "Programs · DMGF";
    const description =
      cb.seo_description ||
      "Women empowerment, youth development, child welfare, healthcare support, education and community rehabilitation programs across Liberia.";
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
  component: Programs,
});

const programs = [
  {
    icon: Sparkles,
    t: "Women Empowerment",
    img: imgWomen,
    items: ["Skills development", "Entrepreneurship", "Financial literacy", "Leadership training"],
  },
  {
    icon: Users,
    t: "Youth Development",
    img: imgYouth,
    items: ["Mentorship", "Career guidance", "Leadership development", "Employment readiness"],
  },
  {
    icon: BookOpen,
    t: "Child Welfare",
    img: imgChild,
    items: ["Educational aid", "Child protection", "School support", "Scholarships"],
  },
  {
    icon: Stethoscope,
    t: "Healthcare Support",
    img: imgHealth,
    items: ["Medical outreach", "Health awareness", "Mental health support", "Community wellness"],
  },
  {
    icon: GraduationCap,
    t: "Educational Support",
    img: imgEducation,
    items: ["Tuition assistance", "Learning materials", "Tutoring", "Higher-education access"],
  },
  {
    icon: Home,
    t: "Community Rehabilitation",
    img: imgAdvocacy,
    items: [
      "Community development",
      "Livelihood support",
      "Social protection",
      "Advocacy initiatives",
    ],
  },
];

function Programs() {
  const { data: cb } = useQuery({
    queryKey: ["pub", "content", "programs"],
    queryFn: () => fetchContentBlocks({ data: { page: "programs" } }),
  });
  const { data: dbPrograms } = useQuery({
    queryKey: ["pub", "programs"],
    queryFn: () => fetchPrograms(),
  });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const campaignList =
    dbPrograms && dbPrograms.length
      ? dbPrograms.map((p) => ({
          program: p.tag || "Program",
          img: p.image_url || undefined,
          title: p.title,
          tag: p.tag || "",
          date: p.date_text || "",
          location: p.location || "",
          summary: p.summary || "",
        }))
      : campaigns;
  return (
    <>
      <PageHero
        eyebrow={t("hero_eyebrow", "Our Programs")}
        title={
          <>
            {t("hero_title_prefix", "Six pillars. ")}
            <span className="text-gradient-gold">{t("hero_title_highlight", "One mission.")}</span>
          </>
        }
        subtitle={t(
          "hero_subtitle",
          "Each program is designed in partnership with the communities we serve — for transformation that lasts beyond a single grant or donation.",
        )}
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 space-y-24">
          {programs.map((p, i) => (
            <div
              key={p.t}
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
                  <img
                    src={p.img}
                    alt={p.t}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-gradient-gold grid place-items-center text-ink shadow-gold">
                  <p.icon className="h-12 w-12" />
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
                  {t("program_label", "Program")} 0{i + 1}
                </div>
                <h2 className="font-display text-4xl lg:text-5xl">{p.t}</h2>
                <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                  {t(
                    "program_body",
                    "A holistic approach combining direct support, training and long-term mentorship to ensure dignity, capacity and sustained outcomes.",
                  )}
                </p>
                <ul className="mt-7 grid sm:grid-cols-2 gap-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex gap-3 flex-wrap">
                  <Link
                    to="/donate"
                    className="btn-fx inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full shadow-gold hover-lift font-medium"
                  >
                    {t("sponsor_cta", "Sponsor this program")} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/volunteer"
                    className="btn-fx inline-flex items-center gap-2 border border-input px-6 py-3 rounded-full hover:border-gold hover:text-gold-deep transition"
                  >
                    {t("volunteer_cta", "Volunteer")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="max-w-2xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
              {t("campaigns_eyebrow", "Campaigns & Initiatives")}
            </div>
            <h2 className="font-display text-4xl lg:text-5xl">
              {t("intro_heading", "Programs in action")}
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {t("intro_body", "Field highlights from our community work across Liberia.")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {campaignList.map((c, idx) => (
              <article
                key={c.program}
                className="group bg-background rounded-2xl overflow-hidden shadow-elegant hover-lift border flex flex-col relative border-border/60"
              >
                <span className="absolute top-3 left-3 z-10 bg-gradient-gold text-ink text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-gold">
                  {c.program}
                </span>
                <div className="aspect-[3/4] overflow-hidden bg-white">
                  <img
                    src={c.img}
                    alt={`${c.program} flyer: ${c.title}`}
                    loading={idx < 3 ? "eager" : "lazy"}
                    className="h-full w-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">
                    {c.tag}
                  </div>
                  <h3 className="font-display text-xl mt-2 leading-snug">{c.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                    {c.summary}
                  </p>
                  <div className="mt-5 pt-5 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-3.5 w-3.5 mt-0.5 text-gold-deep shrink-0" /> {c.date}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-gold-deep shrink-0" /> {c.location}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
