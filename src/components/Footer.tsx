import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/use-server-fn";
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { nav, site } from "@/lib/site";
import { fetchSiteSettings, fetchContentBlocks } from "@/lib/site-data.functions";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

export function Footer() {
  const getSettings = useServerFn(fetchSiteSettings);
  const getContent = useServerFn(fetchContentBlocks);
  const { data: settings } = useQuery({
    queryKey: ["pub", "settings"],
    queryFn: () => getSettings(),
    staleTime: 60_000,
  });
  const { data: cb } = useQuery({
    queryKey: ["pub", "content", "footer"],
    queryFn: () => getContent({ data: { page: "footer" } }),
    staleTime: 60_000,
  });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const s: Partial<NonNullable<typeof settings>> = settings ?? {};
  const address = s.address || site.address;
  const hours = s.hours || site.hours;
  const email = s.email || site.email;
  const phones = [s.phone_primary, s.phone_secondary, s.phone_whatsapp].filter(Boolean) as string[];
  const phoneStr = phones.length ? phones.join(" · ") : site.phones.join(" · ");
  const logoUrl = s.logo_url || logoAsset.url;
  const socials = [
    { Icon: Facebook, url: s.social_facebook },
    { Icon: Instagram, url: s.social_instagram },
    { Icon: Twitter, url: s.social_twitter },
    { Icon: Youtube, url: s.social_youtube },
  ];

  return (
    <footer className="bg-ink text-white/80 pt-20 pb-10 mt-24 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 gold-divider" />
      <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10 grid gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="DMGF" className="h-14 w-14 object-contain bg-transparent shadow-none drop-shadow-none" />
            <div>
              <div className="font-display text-xl text-white">
                {t("footer_brand_name", "Deesire Moore ")}
                <span className="text-gradient-gold">{t("footer_brand_highlight", "Grace")}</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80 mt-1">
                {t("footer_brand_sub", "Foundation · Liberia")}
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/65 max-w-sm">
            {t(
              "footer_blurb",
              `${site.tagline} A legally registered, self-supported nonprofit empowering women, youth and children across Liberia and beyond.`,
            )}
          </p>
          <div className="flex gap-3 mt-6">
            {socials.map(({ Icon, url }, i) => (
              <a
                key={i}
                href={url || "#"}
                aria-label={t("footer_social_aria", "Social")}
                className="h-10 w-10 grid place-items-center rounded-full border border-gold/30 hover:bg-gold hover:text-ink transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">
            {t("footer_explore_heading", "Explore")}
          </h4>
          <ul className="space-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-gold transition">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">
            {t("footer_involved_heading", "Get Involved")}
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/donate" className="hover:text-gold">
                {t("footer_link_donate", "Make a Donation")}
              </Link>
            </li>
            <li>
              <Link to="/volunteer" className="hover:text-gold">
                {t("footer_link_volunteer", "Volunteer With Us")}
              </Link>
            </li>
            <li>
              <Link to="/programs" className="hover:text-gold">
                {t("footer_link_sponsor", "Sponsor a Program")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                {t("footer_link_partnerships", "Partnerships")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">
            {t("footer_contact_heading", "Visit · Contact")}
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {address}
            </li>
            <li className="flex gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {hours}
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" />{" "}
              <a href={`mailto:${email}`} className="hover:text-gold">
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <span>{phoneStr}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-10 mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
        <div>
          {t(
            "footer_copyright",
            "© {year} Deesire Moore Grace Foundation. All rights reserved.",
          ).replace("{year}", String(new Date().getFullYear()))}
        </div>
        <div className="flex items-center gap-4">
          <span>{t("footer_built", "Built with hope from Monrovia, Liberia.")}</span>
          <Link to="/auth" className="hover:text-gold">
            {t("footer_admin", "Admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
