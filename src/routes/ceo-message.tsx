import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgCeo } from "@/assets/images";
import { Quote, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/ceo-message")({
  head: () => ({
    meta: [
      { title: "CEO Message · Ms. Deesire Moore · DMGF" },
      { name: "description", content: "A personal message from Ms. Deesire Moore, Founder & CEO of the Deesire Moore Grace Foundation." },
      { property: "og:title", content: "Message from our Founder & CEO" },
      { property: "og:description", content: "Ms. Deesire Moore shares the heart behind DMGF's mission." },
      { property: "og:image", content: imgCeo },
      { name: "twitter:image", content: imgCeo },
    ],
  }),
  component: CeoMessage,
});

function CeoMessage() {
  return (
    <>
      <PageHero
        eyebrow="From the Founder & CEO"
        title={<>A message from <span className="text-gradient-gold">Ms. Deesire Moore.</span></>}
        subtitle="On compassion, accountability and the future we are building together."
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-10 grid lg:grid-cols-[minmax(0,340px)_1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="rounded-3xl overflow-hidden shadow-elegant bg-ink">
              <img src={imgCeo} alt="Ms. Deesire Moore" className="w-full aspect-[4/5] object-cover" />
            </div>
            <div className="mt-5 text-center lg:text-left">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">Founder & CEO</div>
              <div className="font-display text-2xl mt-1">Ms. Deesire Moore</div>
              <div className="text-sm text-muted-foreground mt-1">Deesire Moore Grace Foundation</div>
            </div>
          </div>

          <article className="prose prose-neutral max-w-none">
            <Quote className="h-10 w-10 text-gold" />
            <p className="font-display text-2xl lg:text-3xl leading-snug mt-4">
              "When we lift one woman, we strengthen a family. When we educate one child, we transform a generation. When we restore hope to a community, we change a nation."
            </p>

            <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed text-base lg:text-lg">
              <p>Dear friends, partners and supporters,</p>
              <p>
                Welcome to the Deesire Moore Grace Foundation. What began as a calling has grown into a movement of compassion — a community of donors, volunteers, staff and beneficiaries working together to restore dignity to the most vulnerable across Liberia.
              </p>
              <p>
                Our promise is simple: every gift, every hour, every prayer becomes tangible change. Whether through healthcare outreach, women's empowerment, youth development or child welfare, we measure success in lives transformed — not just in numbers reported.
              </p>
              <p>
                We work with integrity, accountability and transparency because trust is sacred. Our books are open, our impact is real, and our heart is anchored in service.
              </p>
              <p>
                I invite you to walk with us. Volunteer your time, partner with our programs, or give generously so we can reach further, faster, together.
              </p>
              <p>
                Every life matters. Every child deserves a chance. Every woman deserves opportunity. Every youth deserves hope. Together, we can build stronger communities throughout Liberia and beyond.
              </p>
              <p className="text-ink font-medium">
                With gratitude and grace,<br />
                <span className="font-display text-xl">Ms. Deesire Moore</span><br />
                <span className="text-sm text-muted-foreground">Founder & CEO, Deesire Moore Grace Foundation</span>
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 not-prose">
              <Link to="/donate" className="btn-fx inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium px-6 py-3 rounded-full shadow-gold hover-lift">
                <Heart className="h-4 w-4" /> Support our Mission
              </Link>
              <Link to="/volunteer" className="btn-fx inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition">
                Become a Volunteer <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
