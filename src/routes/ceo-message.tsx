import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgCeo } from "@/assets/images";
import { Quote, Heart, ArrowRight } from "lucide-react";
import { fetchContentBlocks } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/ceo-message")({
  loader: async () => {
    try { return await fetchContentBlocks({ data: { page: "ceo_message" } }); } catch { return {} as Record<string, string>; }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "CEO Message · Ms. Deesire Moore · DMGF";
    const description = cb.seo_description || "A personal message from Ms. Deesire Moore, Founder & CEO of the Deesire Moore Grace Foundation.";
    const ogImage = cb.seo_og_image || imgCeo;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  component: CeoMessage,
});

function CeoMessage() {
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "ceo_message"], queryFn: () => fetchContentBlocks({ data: { page: "ceo_message" } }) });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  return (
    <>
      <PageHero
        eyebrow={t("hero_eyebrow", "From the Founder & CEO")}
        title={<>{t("hero_title_prefix", "A message from ")}<span className="text-gradient-gold">{t("hero_title_highlight", "Ms. Deesire Moore.")}</span></>}
        subtitle={t("hero_subtitle", "On compassion, accountability and the future we are building together.")}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-10 grid lg:grid-cols-[minmax(0,340px)_1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="rounded-3xl overflow-hidden shadow-elegant bg-ink">
              <img src={imgCeo} alt="Ms. Deesire Moore" className="w-full aspect-[4/5] object-cover" />
            </div>
            <div className="mt-5 text-center lg:text-left">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">{t("role_label", "Founder & CEO")}</div>
              <div className="font-display text-2xl mt-1">{t("name", "Ms. Deesire Moore")}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("org_name", "Deesire Moore Grace Foundation")}</div>
            </div>
          </div>

          <article className="prose prose-neutral max-w-none">
            <Quote className="h-10 w-10 text-gold" />
            <p className="font-display text-2xl lg:text-3xl leading-snug mt-4">
              {t("heading", "A note from our Founder & CEO")}
            </p>

            <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed text-base lg:text-lg">
              <p>{t("letter_greeting", "Dear friends, partners and supporters,")}</p>
              <p>
{t("letter_p1", "Welcome to the Deesire Moore Grace Foundation. What began as a calling has grown into a movement of compassion — a community of donors, volunteers, staff and beneficiaries working together to restore dignity to the most vulnerable across Liberia.")}
              </p>
              <p>
{t("letter_p2", "Our promise is simple: every gift, every hour, every prayer becomes tangible change. Whether through healthcare outreach, women's empowerment, youth development or child welfare, we measure success in lives transformed — not just in numbers reported.")}
              </p>
              <p>
                {t("body", "We work with integrity, accountability and transparency because trust is sacred. Our books are open, our impact is real, and our heart is anchored in service.")}
              </p>
              <p>
{t("letter_p4", "I invite you to walk with us. Volunteer your time, partner with our programs, or give generously so we can reach further, faster, together.")}
              </p>
              <p>
{t("letter_p5", "Every life matters. Every child deserves a chance. Every woman deserves opportunity. Every youth deserves hope. Together, we can build stronger communities throughout Liberia and beyond.")}
              </p>
              <p className="text-ink font-medium">
{t("letter_signoff", "With gratitude and grace,")}<br />
                <span className="font-display text-xl">{t("letter_name", "Ms. Deesire Moore")}</span><br />
                <span className="text-sm text-muted-foreground">{t("letter_title_org", "Founder & CEO, Deesire Moore Grace Foundation")}</span>
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 not-prose">
              <Link to="/donate" className="btn-fx inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium px-6 py-3 rounded-full shadow-gold hover-lift">
                <Heart className="h-4 w-4" /> {t("cta_support", "Support our Mission")}
              </Link>
              <Link to="/volunteer" className="btn-fx inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full hover:bg-gold hover:text-ink transition">
{t("cta_volunteer", "Become a Volunteer")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
