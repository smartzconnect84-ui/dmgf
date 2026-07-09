import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Sparkles, Users, BookOpen, Stethoscope, GraduationCap, Home, ArrowRight, Calendar, MapPin } from "lucide-react";
import { imgWomen, imgYouth, imgChild, imgHealth, imgAdvocacy, imgSchool } from "@/assets/images";
import ceoBirthday from "@/assets/flyers/ceo-birthday.jpg.asset.json";
import businessSeminar from "@/assets/flyers/business-seminar.jpg.asset.json";
import multimediaTraining from "@/assets/flyers/multimedia-training.jpg.asset.json";
import womenGrant from "@/assets/flyers/women-grant.jpg.asset.json";
import refreshers from "@/assets/flyers/refreshers.jpg.asset.json";
import womenGrant3rd from "@/assets/flyers/women-grant-3rd-v2.jpg.asset.json";
import careWeek from "@/assets/flyers/care-week-2026.jpg.asset.json";
import inspiringStories from "@/assets/flyers/inspiring-stories.jpg.asset.json";
import closeYourLegs from "@/assets/flyers/close-your-legs-v2.jpg.asset.json";
import backToSchool from "@/assets/flyers/back-to-school.jpg.asset.json";
import africanChild from "@/assets/flyers/african-child.jpg.asset.json";
import actOfKindness from "@/assets/flyers/act-of-kindness.jpg.asset.json";
import breastCancer from "@/assets/flyers/breast-cancer.jpg.asset.json";
import valentinesCouple from "@/assets/flyers/valentines-best-couple.jpg.asset.json";
import antiCorruption from "@/assets/flyers/anti-corruption.jpg.asset.json";
import drugAwareness from "@/assets/flyers/drug-awareness.jpg.asset.json";

// Pillar visuals use real field photography (distinct from the campaign flyers below).
const imgEducation = imgSchool;

const campaigns = [
  {
    img: backToSchool.url,
    title: "Back to School · School Supplies Drive",
    tag: "Live Music · Dance · Drama & Food",
    date: "September 19, 2025 · 11AM–2PM",
    location: "ELWA Community, Paynesville City, Monrovia",
    summary:
      "A community-wide Back to School celebration distributing essential school supplies, with live music, dance, drama and food bringing families together for the new academic year.",
    highlight: true,
  },
  {
    img: africanChild.url,
    title: "Day of an African Child",
    tag: "Planning & Budgeting for Children's Rights",
    date: "June 16, 2025",
    location: "Liberia",
    summary:
      "Commemorating the Day of an African Child under the theme 'Planning and Budgeting for Children's Rights: Progress since 2010' — advocating for sustained investment in every child's future.",
    highlight: true,
  },
  {
    img: breastCancer.url,
    title: "Breast Cancer Campaign 2025",
    tag: "Every Story is unique, Every Journey Matters",
    date: "October 30–31, 2025",
    location: "DMGF · 540 Junction · Montserrado & Grand Bassa",
    summary:
      "A two-day awareness drive — Day 1 Montserrado Awareness Day, Day 2 Grand Bassa Awareness Day — uplifting survivors and educating women on early detection and care.",
    highlight: true,
  },
  {
    img: actOfKindness.url,
    title: "Act of Kindness · Donation",
    tag: "Featuring Precious P. Zarwea, Asatu Morgan, Agnes B.S. Twalla & Grace Neewray",
    date: "May 3, 2025 · 2:00 PM",
    location: "Jacob Town · Rescue for Abandoned Children in Hardship",
    summary:
      "A targeted donation initiative bringing food, supplies and presence to abandoned children facing hardship at the Jacob Town rescue center.",
    highlight: true,
  },
  {
    img: antiCorruption.url,
    title: "Anti-Corruption & Human Rights Campaign",
    tag: "Meet Our Stars",
    date: "August 30–31, 2024",
    location: "CEIO & Intellectual Bureau · Rally-Time Mkt · Live Radio Appearance",
    summary:
      "Two days of advocacy combining a rally, intellectual bureau engagement and live radio — championing transparency, accountability and the protection of human rights.",
    highlight: true,
  },
  {
    img: valentinesCouple.url,
    title: "Valentine's Day · Best Couple Award",
    tag: "1st Winner",
    date: "February 14, 2025",
    location: "Monrovia, Liberia",
    summary:
      "Honoring Min Fred F. Palay & Amelia Holmes Palay as the 1st Winners of the Best Couple Award — celebrating love, partnership and family as foundations of community.",
    highlight: true,
  },
  {
    img: drugAwareness.url,
    title: "Drug Abuse Awareness & Prevention Campaign",
    tag: "Choose Life, Not Harmful Drugs",
    date: "Aug 4, 2024",
    location: "Monrovia, Liberia",
    summary:
      "A youth-led awareness campaign confronting the rising tide of drug abuse, featuring rising-star ambassadors mobilizing communities to choose life over harmful substances.",
  },
  {
    img: ceoBirthday.url,
    title: "CEO's Birthday Dinner & Honoring",
    tag: "Honoring · Fundraising · Networking",
    date: "March 22, 2025",
    location: "360 Bar & Restaurant, Rehab Junction, Paynesville",
    summary:
      "A combined celebration honoring special guests, presenting acceptance letters to volunteer staff, fundraising, games, performances and networking. Dress code: Gold & Black.",
  },
  {
    img: businessSeminar.url,
    title: "Accelerated Business & Communication Seminars for Youths",
    tag: "Unlocking Entrepreneurial Potential",
    date: "June – July 2025",
    location: "Lagos & Kaduna, Nigeria · Accra & Tamale, Ghana",
    summary:
      "Cross-border seminars led by Madam Deesire Sonpon and Mr. Shedrick K. Nungehn equipping young entrepreneurs with strategies to unleash creativity, drive innovation and grow their businesses.",
  },
  {
    img: multimediaTraining.url,
    title: "5-Day Mobile Multimedia Training",
    tag: "Free · Hands-on · Career-ready",
    date: "Nov 24 – Dec 3, 2025",
    location: "DMGF Headquarters, Congo Town, Monrovia",
    summary:
      "Free training in mobile photo & video shooting/editing, audio production and graphic design — running Mon/Wed/Fri, 3:00–5:00 PM at the Deesire Moore Grace Training Center.",
  },
  {
    img: womenGrant.url,
    title: "Women Small Business Grant Initiative",
    tag: "Empowering Women · Growing Business",
    date: "Deadline: May 14, 2025",
    location: "Liberia (Online Application)",
    summary:
      "Cash grants from $100 to $1,200 for seven winners, plus a business-skills workshop, 3–6 month 1-on-1 mentorship, media exposure and membership in the DMGF Women Empowerment Network.",
  },
  {
    img: refreshers.url,
    title: "Free Refresher Training",
    tag: "Project Management · M&E · Human Rights",
    date: "Nov 29, 2025",
    location: "Repentance Baptist Church, Gbarnga, Bong County",
    summary:
      "A one-day capacity-building refresher in Project Management, Monitoring & Evaluation and Human Rights, led by GD Shedrick K. Nungehn and Director Mark G. Gray.",
  },
  {
    img: womenGrant3rd.url,
    title: "Women's Empowerment Grant — 3rd Edition Ceremony",
    tag: "Grant Award & Certification",
    date: "Dec 17, 2025 · 2–4 PM",
    location: "MVTC Theater, Japan Freeway",
    summary:
      "Celebrating the 3rd edition winners — Delvin Williams, Princess Saoballah Borbor, Janet W. Gbidi, Victoria Kolubah, Aminata Athonty-Salami, Dorcas G. Doe and Sannie F. Gant.",
  },
  {
    img: careWeek.url,
    title: "3rd Annual Care Week 2026",
    tag: "In honor of the late Mrs. Henrietta J. Moore B.P.",
    date: "May 11 – 15, 2026",
    location: "Monrovia & Greater Liberia",
    summary:
      "A full week of community engagement: West Point outreach, G77 Newport Street initiative, Anna N Enoch Orphanage mission, Monrovia Central Prison visit and Tannapoli Clinic & JFK Memorial Hospital visits.",
  },
  {
    img: inspiringStories.url,
    title: "Inspiring Stories Through Photos — Empowering Men",
    tag: "$250 USD / 50,000 LRD Prize",
    date: "Deadline: October 27, 2025",
    location: "Submissions via WhatsApp +231 881633095",
    summary:
      "Men 25 and older share a photo and short story (≤200 words) reflecting resilience, leadership, courage or purpose. Best story wins the grand prize.",
  },
  {
    img: closeYourLegs.url,
    title: "Close Your Legs Awareness Campaign",
    tag: "Breaking Barriers & Implementing Women Power",
    date: "March 28, 2026",
    location: "ELWA, Paynesville to Paynesville City Park",
    summary:
      "A bold women-led march and awareness campaign reinforcing bodily autonomy, dignity and the message that a woman's body is her greatest pride — not for trade.",
  },
];

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
  { icon: GraduationCap, t: "Educational Support", img: imgEducation, items: ["Tuition assistance", "Learning materials", "Tutoring", "Higher-education access"] },
  { icon: Home, t: "Community Rehabilitation", img: imgAdvocacy, items: ["Community development", "Livelihood support", "Social protection", "Advocacy initiatives"] },
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

      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="max-w-2xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Campaigns & Initiatives</div>
            <h2 className="font-display text-4xl lg:text-5xl">Programs in <span className="text-gradient-gold">action</span></h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Flagship campaigns, trainings and outreach activities our team has delivered and continues to deliver across Liberia and West Africa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {campaigns.map((c) => (
              <article key={c.title} className={`group bg-background rounded-2xl overflow-hidden shadow-elegant hover-lift border flex flex-col relative ${c.highlight ? "border-gold/60 ring-1 ring-gold/30" : "border-border/60"}`}>
                {c.highlight && (
                  <span className="absolute top-3 left-3 z-10 bg-gradient-gold text-ink text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-gold">
                    Highlight
                  </span>
                )}
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{c.tag}</div>
                  <h3 className="font-display text-xl mt-2 leading-snug">{c.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{c.summary}</p>
                  <div className="mt-5 pt-5 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2"><Calendar className="h-3.5 w-3.5 mt-0.5 text-gold-deep shrink-0" /> {c.date}</div>
                    <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 mt-0.5 text-gold-deep shrink-0" /> {c.location}</div>
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
