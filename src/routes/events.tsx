import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { fetchContentBlocks, fetchEvents } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/events")({
  loader: async () => {
    try { return await fetchContentBlocks({ data: { page: "events" } }); } catch { return {} as Record<string, string>; }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "Events · DMGF";
    const description = cb.seo_description || "Upcoming fundraisers, outreach programs, workshops and conferences from Deesire Moore Grace Foundation.";
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
  component: Events,
});

const events = [
  { d: "Mar 14", t: "Annual Gala: Hope Rising", loc: "Monrovia", tag: "Fundraiser" },
  { d: "Apr 02", t: "Women's Skills Bootcamp", loc: "Bomi County", tag: "Workshop" },
  { d: "Apr 21", t: "Community Medical Outreach", loc: "Margibi County", tag: "Outreach" },
  { d: "May 10", t: "Youth Leadership Conference", loc: "Monrovia", tag: "Conference" },
  { d: "Jun 05", t: "Scholarship Awards Ceremony", loc: "Congo Town HQ", tag: "Ceremony" },
  { d: "Jul 18", t: "Mental Health Awareness Walk", loc: "Sinkor Beachfront", tag: "Advocacy" },
];

function Events() {
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "events"], queryFn: () => fetchContentBlocks({ data: { page: "events" } }) });
  const { data: dbEvents } = useQuery({ queryKey: ["pub", "events"], queryFn: () => fetchEvents() });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const events = (dbEvents && dbEvents.length)
    ? dbEvents.map((e: any) => ({ d: e.date_text || "", t: e.title, loc: e.location || "", tag: e.tag || "Event", img: e.image_url, desc: e.description || "" }))
    : [
        { d: "Mar 14", t: "Annual Gala: Hope Rising", loc: "Monrovia", tag: "Fundraiser" },
        { d: "Apr 02", t: "Women's Skills Bootcamp", loc: "Bomi County", tag: "Workshop" },
        { d: "Apr 21", t: "Community Medical Outreach", loc: "Margibi County", tag: "Outreach" },
        { d: "May 10", t: "Youth Leadership Conference", loc: "Monrovia", tag: "Conference" },
        { d: "Jun 05", t: "Scholarship Awards Ceremony", loc: "Congo Town HQ", tag: "Ceremony" },
        { d: "Jul 18", t: "Mental Health Awareness Walk", loc: "Sinkor Beachfront", tag: "Advocacy" },
      ];
  return (
    <>
      <PageHero
        eyebrow="Events & Campaigns"
        title={t("intro_heading", "Show up. Stand together.") as any}
        subtitle={t("intro_body", "From fundraising galas to grassroots outreach, every event is a chance to be the change.")}
      />

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-10 grid sm:grid-cols-2 gap-6">
          {events.map((e) => (
            <article key={e.t} className="group rounded-3xl border bg-card overflow-hidden hover-lift">
              <div className="flex">
                <div className="w-28 sm:w-32 bg-gradient-ink text-white p-6 grid place-items-center text-center">
                                      <div>
                    <div className="font-display text-2xl text-gradient-gold leading-none">{e.d || "—"}</div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{e.tag}</span>
                  <h3 className="font-display text-xl mt-2">{e.t}</h3>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {e.loc}
                  </div>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm text-gold-deep group-hover:gap-3 transition-all">
                    Register <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-10 text-center">
          <Calendar className="h-10 w-10 text-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl">Hosting an event for DMGF?</h2>
          <p className="text-muted-foreground mt-3">
            From corporate fundraisers to community drives, we'd love to partner with you.
          </p>
        </div>
      </section>
    </>
  );
}
