import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { imgWomen, imgYouth, imgChild, imgHealth, imgHero, imgPrevention, imgDrugs, imgSchool, imgAdvocacy, imgMtnHero } from "@/assets/images";
import { fetchContentBlocks, fetchGalleryItems } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    try { return await fetchContentBlocks({ data: { page: "gallery" } }); } catch { return {} as Record<string, string>; }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "Gallery · DMGF";
    const description = cb.seo_description || "Photos and stories from the field — communities, programs and transformation.";
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
  component: Gallery,
});

const photos = [
  { src: imgMtnHero, t: "MTN Hero of Change 2026 · Global Director Mr. Shedrick K. Nungehn with Brand Ambassador Ms. Sannah K. Ballah", c: "MTN Hero of Change · 2026" },
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
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "gallery"], queryFn: () => fetchContentBlocks({ data: { page: "gallery" } }) });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const { data } = useQuery({ queryKey: ["pub", "gallery"], queryFn: () => fetchGalleryItems() });
  const dbPhotos = (data ?? []).map((g: any) => ({ src: g.image_url, t: g.caption || "Gallery", c: g.alt_text || "" }));
  const photos = dbPhotos.length ? dbPhotos : [
    { src: imgMtnHero, t: "MTN Hero of Change 2026 · Global Director Mr. Shedrick K. Nungehn with Brand Ambassador Ms. Sannah K. Ballah", c: "MTN Hero of Change · 2026" },
    { src: imgWomen, t: "Women Empowerment · Graduation Edition", c: "Monrovia · 2025" },
    { src: imgYouth, t: "Youth Seminar & Training", c: "DMGF HQ · Monrovia" },
  ];
  return (
    <>
      <PageHero
        eyebrow={t("hero_eyebrow", "Gallery")}
        title={<>{t("hero_title_prefix", "Moments of ")}<span className="text-gradient-gold">{t("hero_title_highlight", "hope.")}</span></>}
        subtitle={t("hero_subtitle", "A visual archive of the people, places and partnerships that make our work possible.")}
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
