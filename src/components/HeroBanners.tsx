import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import mtnHero from "@/assets/heroes/mtn-hero-change.jpg.asset.json";
import ceoDinner from "@/assets/heroes/ceo-dinner.jpg.asset.json";
import backToSchool from "@/assets/heroes/back-to-school-kids.jpg.asset.json";
import careWeek from "@/assets/heroes/care-week-prison.jpg.asset.json";
import breastCancer from "@/assets/heroes/breast-cancer-school.jpg.asset.json";
import prevention from "@/assets/heroes/pregnancy-prevention.jpg.asset.json";

type Banner = {
  img: string;
  eyebrow: string;
  title: string;
  body: string;
  date: string;
  location: string;
  cta: { label: string; to: string };
  focus?: string;
};

const banners: Banner[] = [
  {
    img: mtnHero.url,
    eyebrow: "MTN Hero of Change 2026",
    title: "Recognized on a national stage",
    body: "Global Director Mr. Shedrick K. Nungehn and Brand Ambassador Ms. Sannah K. Ballah represent DMGF at the MTN Hero of Change 2026 — a proud moment for the foundation's growing impact.",
    date: "2026",
    location: "MTN Hero of Change · Liberia",
    cta: { label: "Meet the team", to: "/team" },
    focus: "object-[50%_30%]",
  },
  {
    img: ceoDinner.url,
    eyebrow: "CEO's Birthday Dinner & Honoring",
    title: "Honoring service, fueling the mission",
    body: "A gold-and-black evening uniting volunteers, partners and special guests — honoring our staff, presenting acceptance letters, fundraising and networking for the year ahead.",
    date: "March 22, 2025",
    location: "360 Bar & Restaurant · Rehab Junction, Paynesville",
    cta: { label: "View programs", to: "/programs" },
  },
  {
    img: backToSchool.url,
    eyebrow: "Back to School · Supplies Drive",
    title: "Every child ready to learn",
    body: "Backpacks and essential school supplies handed directly to children in the ELWA community — a joyful start to the academic year with live music, dance, drama and food.",
    date: "September 19, 2025",
    location: "ELWA Community, Paynesville City, Monrovia",
    cta: { label: "Sponsor a child", to: "/donate" },
  },
  {
    img: careWeek.url,
    eyebrow: "3rd Annual Care Week",
    title: "Care that reaches behind every wall",
    body: "DMGF volunteers at Monrovia Central Prison during Care Week — extending dignity, hope and tangible support to those most often forgotten by society.",
    date: "May 11 – 15, 2026",
    location: "Monrovia Central Prison · Greater Liberia",
    cta: { label: "Join Care Week", to: "/volunteer" },
    focus: "object-[50%_35%]",
  },
  {
    img: breastCancer.url,
    eyebrow: "Breast Cancer Campaign 2025",
    title: "Every story is unique. Every journey matters.",
    body: "Taking awareness directly into schools — equipping young women and men with the knowledge to detect early, support survivors and break the silence around breast cancer.",
    date: "October 30 – 31, 2025",
    location: "Montserrado & Grand Bassa Counties",
    cta: { label: "Read the campaign", to: "/programs" },
  },
  {
    img: prevention.url,
    eyebrow: "Early-Unwanted Pregnancy Prevention",
    title: "Protecting the futures of our girls",
    body: "A community awareness drive across Duazohn, Boystown, Bens' Town and Schiefflin Town — empowering young people with information, choice and life-changing support.",
    date: "August 22, 2025 · 11AM – 3PM",
    location: "Margibi County, Liberia",
    cta: { label: "Support advocacy", to: "/donate" },
  },
];

export function HeroBanners() {
  const [i, setI] = useState(0);
  const n = banners.length;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n]);

  const b = banners[i];

  return (
    <section className="relative bg-ink text-white">
      <div className="relative min-h-[100svh] overflow-hidden">
        {banners.map((banner, idx) => (
          <img
            key={banner.img}
            src={banner.img}
            alt={banner.title}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${banner.focus ?? "object-center"} ${idx === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />

        <div className="relative h-full min-h-[100svh] mx-auto max-w-7xl px-5 lg:px-10 flex items-end pb-20 pt-40 lg:pb-28">
          <div className="max-w-3xl">
            <div key={`eb-${i}`} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[11px] uppercase tracking-[0.28em] text-gold mb-6 reveal">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> {b.eyebrow}
            </div>
            <h1 key={`t-${i}`} className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02] reveal-up">
              {b.title}
            </h1>
            <p key={`b-${i}`} className="mt-6 text-white/80 text-base sm:text-lg lg:text-xl max-w-2xl reveal-up">
              {b.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> {b.date}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {b.location}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={b.cta.to} className="group inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium px-7 py-3.5 rounded-full shadow-gold hover-lift">
                {b.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/donate" className="inline-flex items-center gap-2 border border-gold/50 text-white px-7 py-3.5 rounded-full hover:bg-gold/10 transition">
                Donate
              </Link>
            </div>
          </div>
        </div>

        {/* Controls */}
        <button
          aria-label="Previous banner"
          onClick={() => setI((p) => (p - 1 + n) % n)}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-full glass border border-white/15 hover:border-gold/60 hover:text-gold transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next banner"
          onClick={() => setI((p) => (p + 1) % n)}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-full glass border border-white/15 hover:border-gold/60 hover:text-gold transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-gold" : "w-4 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
      <div className="gold-divider" />
    </section>
  );
}
