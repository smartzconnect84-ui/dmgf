export const site = {
  name: "Deesire Moore Grace Foundation",
  short: "DMGF",
  tagline: "Giving Hope. Empowering Communities. Transforming Lives.",
  address: "Congo Town, Opposite EJS Ministerial Complex, Monrovia, Liberia",
  hours: "Monday – Saturday · 9:00 AM – 5:00 PM",
  email: "info24dmgf@gmail.com",
  phones: ["0777513816", "0776679963", "+231 888061379"],
  payments: {
    orangeMoney: "+231 776679963",
    mtnMomo: "+231 888061378",
  },
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/impact", label: "Impact" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;
