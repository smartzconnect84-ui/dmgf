import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMyStaffProfile } from "@/lib/staff.functions";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Users,
  Stethoscope,
  Home as HomeIcon,
  BookOpen,
  GraduationCap,
  Quote,
} from "lucide-react";
import { imgWomen, imgYouth, imgChild, imgHealth, imgAdvocacy } from "@/assets/images";
import { Counter } from "@/components/Counter";
import { HeroBanners } from "@/components/HeroBanners";
import { fetchContentBlocks } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/use-server-fn";
import { submitForm } from "@/lib/cms.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    let profile: { isAdmin?: boolean; isStaff?: boolean } | null = null;
    try {
      profile = (await getMyStaffProfile()) as { isAdmin?: boolean; isStaff?: boolean };
    } catch {
      return;
    }
    if (profile?.isAdmin) throw redirect({ to: "/admin" });
    if (profile?.isStaff) throw redirect({ to: "/staff" });
  },
  loader: async () => {
    try {
      return await fetchContentBlocks({ data: { page: "home" } });
    } catch {
      return {} as Record<string, string>;
    }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "DMGF · Giving Hope. Empowering Communities. Transforming Lives.";
    const description =
      cb.seo_description ||
      "Deesire Moore Grace Foundation — a Liberian nonprofit empowering women, youth and children through education, healthcare, livelihoods and advocacy.";
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
  component: Home,
});

function Home() {
  const { data: cb } = useQuery({
    queryKey: ["pub", "content", "home"],
    queryFn: () => fetchContentBlocks({ data: { page: "home" } }),
  });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const submit = useServerFn(submitForm);
  const programs = [
    {
      title: t("program_1_title", "Women Empowerment"),
      desc: t(
        "program_1_desc",
        "Skills, entrepreneurship, financial literacy and leadership for women across Liberia.",
      ),
      img: imgWomen,
      icon: Sparkles,
      to: "/programs",
    },
    {
      title: t("program_2_title", "Youth Development"),
      desc: t(
        "program_2_desc",
        "Mentorship, career guidance and employment readiness for the next generation of leaders.",
      ),
      img: imgYouth,
      icon: Users,
      to: "/programs",
    },
    {
      title: t("program_3_title", "Child Welfare"),
      desc: t(
        "program_3_desc",
        "Educational aid, scholarships, school support and child protection initiatives.",
      ),
      img: imgChild,
      icon: BookOpen,
      to: "/programs",
    },
    {
      title: t("program_4_title", "Healthcare Support"),
      desc: t(
        "program_4_desc",
        "Medical outreach, mental health support and community wellness programs.",
      ),
      img: imgHealth,
      icon: Stethoscope,
      to: "/programs",
    },
    {
      title: t("program_5_title", "Educational Support"),
      desc: t(
        "program_5_desc",
        "Books, supplies, tuition and scholarships for vulnerable learners.",
      ),
      img: imgChild,
      icon: GraduationCap,
      to: "/programs",
    },
    {
      title: t("program_6_title", "Community Rehabilitation"),
      desc: t(
        "program_6_desc",
        "Livelihoods, social protection and advocacy for thriving communities.",
      ),
      img: imgAdvocacy,
      icon: HomeIcon,
      to: "/programs",
    },
  ];
  const stories = [
    {
      name: t("story_1_name", "Mariama K."),
      role: t("story_1_role", "Entrepreneur, Bomi County"),
      quote: t(
        "story_1_quote",
        "DMGF gave me the training and seed funding to open my tailoring shop. Today I employ three other women from my community.",
      ),
    },
    {
      name: t("story_2_name", "Joseph T."),
      role: t("story_2_role", "Youth Graduate, Monrovia"),
      quote: t(
        "story_2_quote",
        "Through the youth program I learned digital skills and now work as a junior IT technician. My family's life has changed.",
      ),
    },
    {
      name: t("story_3_name", "Nurse Ruth"),
      role: t("story_3_role", "Healthcare Partner"),
      quote: t(
        "story_3_quote",
        "Their medical outreach has reached villages no other organisation visits. The compassion is real and consistent.",
      ),
    },
  ];
  const stats = [
    { label: t("stat_lives", "Lives Impacted"), value: 12500, suffix: "+" },
    { label: t("stat_women", "Women Empowered"), value: 2400, suffix: "+" },
    { label: t("stat_youth", "Youth Trained"), value: 1800, suffix: "+" },
    { label: t("stat_children", "Children Supported"), value: 3600, suffix: "+" },
    { label: t("stat_communities", "Communities Reached"), value: 48, suffix: "" },
    { label: t("stat_volunteers", "Volunteers Engaged"), value: 320, suffix: "+" },
  ];
  return (
    <>
      {/* HERO — rotating story banners */}
      <HeroBanners />

      {/* MISSION STRIP */}
      <section className="bg-ink text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 gold-divider" />
        <div className="mx-auto max-w-5xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-5">
            {t("promise_eyebrow", "Our Promise")}
          </div>
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-snug">
            {t(
              "promise_text",
              "Every child deserves a future. Every woman deserves an opportunity. Every youth deserves hope. Together, we transform lives.",
            )}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 gold-divider" />
      </section>

      {/* IMPACT COUNTERS */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
                {t("impact_eyebrow", "Measured Impact")}
              </div>
              <h2 className="font-display text-4xl lg:text-5xl">
                {t("impact_heading", "A foundation built on results.")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-elegant">
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-8 lg:p-10">
                <div className="font-display text-4xl lg:text-6xl text-ink">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 h-px w-10 bg-gold" />
                <div className="mt-3 text-sm uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
              {t("programs_eyebrow", "What We Do")}
            </div>
            <h2 className="font-display text-4xl lg:text-6xl">
              {t("programs_heading", "Programs that restore dignity and unlock potential.")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((p) => (
              <Link
                key={p.title}
                to={p.to}
                className="group relative rounded-3xl overflow-hidden bg-ink text-white hover-lift"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-10 w-10 rounded-full bg-gradient-gold text-ink grid place-items-center">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                      Program
                    </span>
                  </div>
                  <h3 className="font-display text-2xl">{p.title}</h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-gold">
                    Learn more{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
              {t("stories_eyebrow", "Success Stories")}
            </div>
            <h2 className="font-display text-4xl lg:text-6xl">
              {t("stories_heading", "Transformation, in their own words.")}
            </h2>
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
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4">
                  {t("cta_eyebrow", "Your Gift, Their Future")}
                </div>
                <h2 className="font-display text-4xl lg:text-6xl text-white">
                  {t("cta_heading", "Be the reason someone hopes again.")}
                </h2>
                <p className="mt-6 text-white/70 max-w-lg">
                  {t(
                    "cta_body",
                    "100% of donations go directly to programs. Every dollar feeds, teaches, heals and lifts another life in Liberia.",
                  )}
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
                <Link
                  to="/donate"
                  className="btn-fx col-span-2 inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-4 rounded-2xl shadow-gold hover-lift"
                >
                  <Heart className="h-5 w-5" /> {t("cta_button", "Donate Now")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pb-10">
        <div className="mx-auto max-w-4xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
            {t("newsletter_eyebrow", "Stay Connected")}
          </div>
          <h2 className="font-display text-3xl lg:text-4xl">
            {t("newsletter_heading", "Follow our journey of transformation.")}
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await submit({
                  data: { kind: "newsletter", email: String(fd.get("email") || "") },
                });
                alert(t("newsletter_success", "Subscribed. Thank you!"));
                e.currentTarget.reset();
              } catch (err) {
                alert((err as Error).message);
              }
            }}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="your.email@example.com"
              className="flex-1 rounded-full border border-input bg-white px-6 py-3.5 text-sm outline-none focus:border-gold"
              aria-label="Email address"
            />
            <button className="rounded-full bg-ink text-white px-6 py-3.5 text-sm font-medium hover:bg-gold hover:text-ink transition">
              {t("newsletter_submit", "Subscribe")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}