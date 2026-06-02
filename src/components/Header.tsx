import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { nav, site } from "@/lib/site";
import logoAsset from "@/assets/dmgf-logo.png.asset.json";
const logo = logoAsset.url;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-ink/85 backdrop-blur-xl border-b border-gold/20" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="Deesire Moore Grace Foundation"
            className="h-12 w-12 lg:h-14 lg:w-14 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-base text-white tracking-wide">Deesire Moore Grace</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold/80">Foundation · Liberia</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm text-white/80 hover:text-gold transition-colors relative group"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/volunteer"
            className="hidden md:inline-flex text-sm px-4 py-2 text-white/90 border border-gold/40 rounded-full hover:bg-gold/10 transition"
          >
            Volunteer
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium text-sm px-5 py-2.5 rounded-full shadow-gold hover-lift"
          >
            <Heart className="h-4 w-4" /> Donate
          </Link>
          <button
            aria-label="Open menu"
            className="lg:hidden ml-1 h-10 w-10 grid place-items-center text-white"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-ink/95 backdrop-blur-xl border-t border-gold/20 reveal">
          <div className="px-5 py-6 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-white/85 hover:text-gold border-b border-white/5"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/volunteer"
              onClick={() => setOpen(false)}
              className="mt-3 text-center py-3 border border-gold/40 rounded-full text-white"
            >
              Become a Volunteer
            </Link>
            <a href={`tel:${site.phones[2].replace(/\s/g, "")}`} className="mt-2 text-center text-sm text-gold/80">
              {site.phones[2]}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
