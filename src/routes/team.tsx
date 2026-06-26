import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgCeo, imgSannah, imgShedrick, imgProgramDir, imgCommsDir } from "@/assets/images";
import { ArrowRight, Mail } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team · Deesire Moore Grace Foundation" },
      { name: "description", content: "Meet the leadership of DMGF — Founder & CEO Ms. Deesire Moore, Global Director Mr. Shedrick K. Nungehn, Communication Director, Program Director, Financial Director, Brand Ambassador Ms. Sannah K. Ballah." },
      { property: "og:title", content: "Our Team · DMGF" },
      { property: "og:description", content: "The people leading Deesire Moore Grace Foundation." },
      { property: "og:image", content: imgCeo },
      { name: "twitter:image", content: imgCeo },
    ],
  }),
  component: Team,
});

/* ------------------------------------------------------------------ */
//  Team data — swap in real names / headshots as they become available
/* ------------------------------------------------------------------ */

type Member = {
  name: string;
  role: string;
  img?: string;
  crop?: "center" | "top" | "left" | "right";
  placeholderInitial: string;
};

const leadership: Member[] = [
  {
    name: "Mr. Shedrick K. Nungehn",
    role: "Global Director",
    img: imgMtnHero,
    crop: "left",
    placeholderInitial: "SK",
  },
  {
    name: "Communication Director",
    role: "Communication Director",
    placeholderInitial: "CD",
  },
  {
    name: "Program Director",
    role: "Program Director",
    placeholderInitial: "PD",
  },
  {
    name: "Financial Director",
    role: "Financial Director",
    placeholderInitial: "FD",
  },
  {
    name: "Ms. Sannah K. Ballah",
    role: "Brand Ambassador",
    img: imgMtnHero,
    crop: "right",
    placeholderInitial: "SB",
  },
];

/* ------------------------------------------------------------------ */
//  Sub-components
/* ------------------------------------------------------------------ */

function Headshot({ member }: { member: Member }) {
  const objectPos =
    member.crop === "left"
      ? "20% center"
      : member.crop === "right"
        ? "80% center"
        : member.crop === "top"
          ? "center 15%"
          : "center center";

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-ink">
      {member.img ? (
        <img
          src={member.img}
          alt={member.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: objectPos }}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[oklch(0.18_0_0)] to-[oklch(0.10_0_0)]">
          <span className="font-display text-5xl text-gradient-gold">
            {member.placeholderInitial}
          </span>
        </div>
      )}
      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_-40px_60px_-20px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="group text-center">
      <Headshot member={member} />
      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">
          {member.role}
        </div>
        <div className="font-display text-xl mt-1.5 leading-tight">
          {member.name}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
//  Main page
/* ------------------------------------------------------------------ */

function Team() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title={
          <>
            The people behind{" "}
            <span className="text-gradient-gold">the mission.</span>
          </>
        }
        subtitle="Compassionate leaders and dedicated ambassadors carrying DMGF's work across Liberia."
      />

      {/* ── FOUNDER & CEO ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Headshot — square on mobile, portrait on large screens */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-3xl bg-ink shadow-elegant">
                <img
                  src={imgCeo}
                  alt="Ms. Deesire Moore, Founder & CEO of DMGF"
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-ink via-ink/60 to-transparent">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-gold">
                    Founder & CEO
                  </div>
                  <div className="font-display text-2xl text-white mt-1">
                    Ms. Deesire Moore
                  </div>
                </div>
              </div>
              {/* decorative gold ring */}
              <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-gold/20 hidden lg:block" />
            </div>

            {/* Bio */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
                Founder & CEO
              </div>
              <h2 className="font-display text-4xl lg:text-5xl">
                Ms. Deesire Moore
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                A passionate humanitarian and visionary leader, Ms. Deesire Moore
                founded the Deesire Moore Grace Foundation to restore hope to
                vulnerable women, youth and children across Liberia. Her work
                blends compassion with accountability — building programs that
                empower communities, defend dignity and create real, measurable
                change.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Under her leadership, DMGF has grown into a trusted,
                self-supported nonprofit reaching thousands of beneficiaries
                through healthcare outreach, education, women empowerment and youth
                development.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/ceo-message"
                  className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition"
                >
                  Read CEO Message <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:info24dmgf@gmail.com"
                  className="inline-flex items-center gap-2 border border-input px-6 py-3 rounded-full hover:border-gold transition"
                >
                  <Mail className="h-4 w-4 text-gold-deep" /> Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP GRID ── */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
              Leadership & Ambassadors
            </div>
            <h2 className="font-display text-4xl lg:text-5xl">
              Voices carrying the mission forward.
            </h2>
          </div>

          {/* 1 col mobile → 2 col tablet → 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 max-w-5xl mx-auto">
            {leadership.map((m) => (
              <MemberCard key={m.role} member={m} />
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Pictured together at the{" "}
            <span className="text-gold-deep font-medium">
              MTN Hero of Change 2026
            </span>{" "}
            — representing DMGF on the national stage.
          </p>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
            Join Us
          </div>
          <h2 className="font-display text-3xl lg:text-5xl">
            Want to be part of the team?
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            DMGF is always looking for passionate volunteers, interns and partners
            who share our vision of transforming lives across Liberia.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/volunteer"
              className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition"
            >
              Become a Volunteer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-input px-6 py-3 rounded-full hover:border-gold transition"
            >
              <Mail className="h-4 w-4 text-gold-deep" /> Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
