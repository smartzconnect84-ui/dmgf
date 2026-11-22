import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("dmgf_cookie_consent")) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem("dmgf_cookie_consent", value);
    } catch {}
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/30 bg-ink/95 px-4 py-3 text-sm text-white backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-white/80">
          We use essential cookies to keep the site working and optional cookies to improve your
          experience.{" "}
          <a href="/privacy" className="text-gold underline">Privacy policy</a>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => decide("declined")}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs"
          >
            Decline
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-medium text-ink"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
