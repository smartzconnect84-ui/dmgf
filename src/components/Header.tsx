import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Heart, ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { site } from "@/lib/site";
import logoAsset from "@/assets/dmgf-logo.png.asset.json";
const logo = logoAsset.url;

type NavLeaf = { to: string; label: string; desc?: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const navGroups: NavItem[] = [
  { to: "/", label: "Home" },
  {
    label: "About",
    children: [
      { to: "/about", label: "Our Story", desc: "Mission, vision & values" },
      { to: "/team", label: "Leadership", desc: "Founder, directors & ambassador" },
      { to: "/ceo-message", label: "CEO Message", desc: "A note from our founder" },
    ],
  },
  { to: "/programs", label: "Programs" },
  
  {
    label: "Media",
    children: [
      { to: "/events", label: "Events", desc: "Upcoming & past activities" },
      { to: "/gallery", label: "Gallery", desc: "Photos from the field" },
      { to: "/news", label: "News", desc: "Stories & announcements" },
    ],
  },
  
];

function isGroup(item: NavItem): item is { label: string; children: NavLeaf[] } {
  return (item as { children?: NavLeaf[] }).children !== undefined;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const openDropdown = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 140);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Utility bar */}
      <div
        className={`hidden lg:block transition-all duration-500 border-b border-white/5 ${
          scrolled ? "max-h-0 opacity-0 overflow-hidden" : "max-h-12 opacity-100 bg-ink/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-10 flex items-center justify-between h-10 text-[11px] text-white/70">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gold" /> {site.address}</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-gold" /> <a className="hover:text-gold" href={`mailto:${site.email}`}>{site.email}</a></span>
          </div>
          <div className="flex items-center gap-4">
            <a className="flex items-center gap-1.5 hover:text-gold" href={`tel:${site.phones[2].replace(/\s/g, "")}`}>
              <Phone className="h-3 w-3 text-gold" /> {site.phones[2]}
            </a>
            <span className="text-gold/80 uppercase tracking-[0.2em]">Monrovia · Liberia</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-ink/90 backdrop-blur-xl border-b border-gold/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-b from-ink/60 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-10 lg:py-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={() => setOpen(false)}>
            <img
              src={logo}
              alt="Deesire Moore Grace Foundation"
              className="h-11 w-11 lg:h-14 lg:w-14 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105"
            />
            <div className="leading-tight hidden sm:block">
              <div className="font-display text-base lg:text-[17px] text-white tracking-wide">
                Deesire Moore <span className="text-gradient-gold">Grace</span>
              </div>
              <div className="text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-gold/80 mt-0.5">
                Foundation · Liberia
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" onMouseLeave={scheduleClose}>
            {navGroups.map((item) =>
              isGroup(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openDropdown(item.label)}
                >
                  <button
                    className={`flex items-center gap-1 px-3.5 py-2 text-sm transition-colors ${
                      activeDropdown === item.label ? "text-gold" : "text-white/85 hover:text-gold"
                    }`}
                    aria-expanded={activeDropdown === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === item.label && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[280px]"
                      onMouseEnter={() => openDropdown(item.label)}
                    >
                      <div className="rounded-2xl border border-gold/25 bg-ink/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                        <div className="p-2">
                          {item.children.map((c) => (
                            <Link
                              key={c.to}
                              to={c.to}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-3 py-2.5 rounded-lg hover:bg-gold/10 group"
                            >
                              <div className="text-sm text-white group-hover:text-gold font-medium">
                                {c.label}
                              </div>
                              {c.desc && (
                                <div className="text-[11px] text-white/55 mt-0.5">{c.desc}</div>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3.5 py-2 text-sm text-white/85 hover:text-gold transition-colors relative group"
                  activeProps={{ className: "text-gold" }}
                  activeOptions={{ exact: item.to === "/" }}
                  onMouseEnter={() => setActiveDropdown(null)}
                >
                  {item.label}
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/volunteer"
              className="hidden md:inline-flex text-sm px-4 py-2 text-white/90 border border-gold/40 rounded-full hover:bg-gold/10 hover:border-gold transition"
            >
              Volunteer
            </Link>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-gradient-gold text-ink font-semibold text-sm px-5 py-2.5 rounded-full shadow-gold hover-lift animate-pulse-gold transition-transform active:scale-95"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden xs:inline">Donate</span>
              <span className="xs:hidden">Give</span>
            </Link>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="lg:hidden ml-1 h-10 w-10 grid place-items-center text-white rounded-full border border-white/10 hover:border-gold/40 transition"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[68px] bottom-0 bg-ink/98 backdrop-blur-xl border-t border-gold/20 transition-all duration-300 overflow-y-auto ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-5 py-6 flex flex-col gap-1 max-w-md mx-auto">
          {navGroups.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="border-b border-white/5">
                <button
                  className="w-full flex items-center justify-between px-2 py-3.5 text-white/90 hover:text-gold"
                  onClick={() => setMobileGroup(mobileGroup === item.label ? null : item.label)}
                  aria-expanded={mobileGroup === item.label}
                >
                  <span className="text-[15px]">{item.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileGroup === item.label ? "rotate-180 text-gold" : ""}`}
                  />
                </button>
                {mobileGroup === item.label && (
                  <div className="pb-2 pl-4 border-l border-gold/30 ml-2 mb-2">
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        onClick={() => {
                          setOpen(false);
                          setMobileGroup(null);
                        }}
                        className="block px-3 py-2.5 text-sm text-white/75 hover:text-gold"
                        activeProps={{ className: "text-gold" }}
                      >
                        {c.label}
                        {c.desc && <div className="text-[11px] text-white/45 mt-0.5">{c.desc}</div>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-2 py-3.5 text-[15px] text-white/90 hover:text-gold border-b border-white/5"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ),
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              to="/volunteer"
              onClick={() => setOpen(false)}
              className="text-center py-3 border border-gold/40 rounded-full text-white text-sm hover:bg-gold/10"
            >
              Volunteer
            </Link>
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="text-center py-3 bg-gradient-gold text-ink font-semibold rounded-full text-sm inline-flex items-center justify-center gap-1.5"
            >
              <Heart className="h-4 w-4" /> Donate
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-white/65">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-gold">
              <Mail className="h-4 w-4 text-gold" /> {site.email}
            </a>
            <a href={`tel:${site.phones[2].replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4 text-gold" /> {site.phones[2]}
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <span className="text-xs leading-relaxed">{site.address}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
