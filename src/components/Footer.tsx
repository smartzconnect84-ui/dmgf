import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { nav, site } from "@/lib/site";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

export function Footer() {
  return (
    <footer className="bg-ink text-white/80 pt-20 pb-10 mt-24 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 gold-divider" />
      <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10 grid gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="DMGF" className="h-14 w-14 object-contain" />
            <div>
              <div className="font-display text-xl text-white">Deesire Moore <span className="text-gradient-gold">Grace</span></div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80 mt-1">Foundation · Liberia</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/65 max-w-sm">
            {site.tagline} A legally registered, self-supported nonprofit empowering
            women, youth and children across Liberia and beyond.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social"
                className="h-10 w-10 grid place-items-center rounded-full border border-gold/30 hover:bg-gold hover:text-ink transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">Explore</h4>
          <ul className="space-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-gold transition">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">Get Involved</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/donate" className="hover:text-gold">Make a Donation</Link></li>
            <li><Link to="/volunteer" className="hover:text-gold">Volunteer With Us</Link></li>
            <li><Link to="/programs" className="hover:text-gold">Sponsor a Program</Link></li>
            <li><Link to="/about" className="hover:text-gold">Partnerships</Link></li>
            
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm uppercase tracking-[0.18em] mb-5">Visit · Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {site.address}</li>
            <li className="flex gap-3"><Clock className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {site.hours}</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <span>{site.phones.join(" · ")}</span></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-10 mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
        <div>© {new Date().getFullYear()} Deesire Moore Grace Foundation. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Built with hope from Monrovia, Liberia.</span>
          <Link to="/auth" className="hover:text-gold">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
