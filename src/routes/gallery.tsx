import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgWomen, imgYouth, imgChild, imgHealth, imgHero, imgPrevention, imgDrugs, imgSchool, imgAdvocacy } from "@/assets/images";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · DMGF" },
      { name: "description", content: "Photos and stories from the field — communities, programs and transformation." },
      { property: "og:title", content: "DMGF Gallery" },
      { property: "og:description", content: "Moments of hope across Liberia." },
    ],
  }),
  component: Gallery,
});

const photos = [
  { src: imgWomen, t: "Women Empowerment · Graduation Edition", c: "Monrovia · 2025" },
  { src: imgYouth, t: "Youth Seminar & Training", c: "DMGF HQ · Monrovia" },
  { src: imgAdvocacy, t: "Say No To Drugs Advocacy March", c: "Monrovia · Aug 2025" },
  { src: imgHealth, t: "Community Health Outreach", c: "Monrovia · 2025" },
  { src: imgPrevention, t: "Early Pregnancy Prevention Campaign", c: "Margibi County · Aug 2025" },
  { src: imgDrugs, t: "Say No To Drugs Team", c: "Monrovia · 2025" },
  { src: imgSchool, t: "Prevention Outreach in Schools", c: "Margibi County" },
  { src: imgHero, t: "Community Day", c: "Bomi County" },
  { src: imgChild, t: "Back to School", c: "Margibi" },
  { src: imgChild, t: "Scholarship Awards", c: "Congo Town" },
];

function Gallery() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Moments of <span className="text-gradient-gold">hope.</span></>}
        subtitle="A visual archive of the people, places and partnerships that make our work possible."
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {photos.map((p, i) => (
              <figure key={i} className="mb-5 break-inside-avoid group relative rounded-2xl overflow-hidden bg-ink hover-lift">
                <img src={p.src} alt={p.t} loading="lazy" className="w-full object-cover group-hover:scale-105 transition duration-700" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink to-transparent text-white">
                  <div className="font-display text-lg">{p.t}</div>
                  <div className="text-xs text-gold/80 uppercase tracking-[0.18em]">{p.c}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
