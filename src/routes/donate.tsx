import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { Heart, Repeat, Building2, Smartphone, Landmark, CreditCard } from "lucide-react";
import { site } from "@/lib/site";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate · DMGF" },
      {
        name: "description",
        content:
          "Discuss a one-time, monthly, or sponsorship donation supporting women, youth and children in Liberia.",
      },
      { property: "og:title", content: "Donate to DMGF" },
      {
        property: "og:description",
        content: "Your generosity becomes school supplies, healthcare, training and hope.",
      },
    ],
  }),
  component: Donate,
});

const tiers = [25, 50, 100, 250, 500, 1000];
const impactCopy: Record<number, string> = {
  25: "Supports school supplies for a child for one term.",
  50: "Provides healthcare and medication for a family.",
  100: "Sponsors a youth in vocational training.",
  250: "Funds a community development project.",
  500: "Sponsors an educational initiative for a class.",
  1000: "Transforms an entire community with sustained support.",
};

function Donate() {
  const [amount, setAmount] = useState(100);
  const [freq, setFreq] = useState<"one" | "monthly">("one");
  const [custom, setCustom] = useState("");

  return (
    <>
      <PageHero
        eyebrow="Make a Donation"
        title={
          <>
            Your gift, <span className="text-gradient-gold">their future.</span>
          </>
        }
        subtitle="Every contribution — large or small — funds real programs that change real lives across Liberia."
      />

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-10 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 rounded-3xl border bg-card p-8 lg:p-10 shadow-elegant">
            <div className="flex gap-2 p-1 bg-secondary rounded-full w-fit mb-8">
              {[
                { k: "one", label: "One-Time", icon: Heart },
                { k: "monthly", label: "Monthly", icon: Repeat },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFreq(f.k as "one" | "monthly")}
                  className={`px-5 py-2 rounded-full text-sm flex items-center gap-2 transition ${
                    freq === f.k ? "bg-ink text-white shadow" : "text-muted-foreground"
                  }`}
                >
                  <f.icon className="h-4 w-4" /> {f.label}
                </button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mb-3">Choose an amount (USD)</div>
            <div className="grid grid-cols-3 gap-3">
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setAmount(t);
                    setCustom("");
                  }}
                  className={`rounded-2xl py-5 font-display text-2xl border transition ${
                    amount === t && !custom
                      ? "bg-gradient-gold text-ink border-transparent shadow-gold"
                      : "bg-white border-input hover:border-gold"
                  }`}
                >
                  ${t}
                </button>
              ))}
            </div>

            <div className="mt-4 relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value.replace(/[^\d]/g, ""));
                  if (e.target.value) setAmount(Number(e.target.value) || 0);
                }}
                placeholder="Custom amount"
                className="btn-fx w-full rounded-2xl border border-input px-10 py-4 text-lg outline-none focus:border-gold"
                inputMode="numeric"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-5 text-sm">
              <span className="font-display text-base text-ink">
                ${custom || amount} {freq === "monthly" && "/month"}
              </span>{" "}
              —{" "}
              <span className="text-muted-foreground">
                {impactCopy[amount] || "Funds critical work across our programs."}
              </span>
            </div>

            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("Donation inquiry")}&body=${encodeURIComponent(`I would like to discuss a ${freq === "monthly" ? "monthly" : "one-time"} donation of $${custom || amount} USD.`)}`}
              className="btn-fx mt-7 w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-medium py-4 rounded-full hover:bg-gold hover:text-ink transition"
            >
              <Heart className="h-5 w-5" /> Discuss a ${custom || amount} donation
              {freq === "monthly" && " monthly"}
            </a>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Online checkout is not enabled. Contact our team to arrange a donation and receive
              payment instructions.
            </p>
          </div>

          <aside className="lg:col-span-2 space-y-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              Payment methods
            </div>

            <Method
              icon={CreditCard}
              title="Online payment"
              desc="Online checkout is not enabled. Contact our team for current donation options."
            />
            <Method icon={Smartphone} title="Orange Money" desc={site.payments.orangeMoney} />
            <Method icon={Smartphone} title="MTN Mobile Money" desc={site.payments.mtnMomo} />
            <Method
              icon={Landmark}
              title="Bank Transfer"
              desc="Contact us for account details and reference codes."
            />
            <Method
              icon={Building2}
              title="Sponsorship & Partnerships"
              desc="Sponsor a community, program, scholarship or healthcare drive."
            />
          </aside>
        </div>
      </section>

      <section className="py-20 bg-ink text-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
            Sponsorship Programs
          </div>
          <h2 className="font-display text-3xl lg:text-5xl">Sponsor what matters most to you.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 text-left">
            {[
              { t: "Project Sponsorship", d: "Underwrite a specific initiative end-to-end." },
              {
                t: "Community Sponsorship",
                d: "Lift an entire community with integrated support.",
              },
              { t: "Education Sponsorship", d: "Fund tuition, books and mentorship for learners." },
              { t: "Healthcare Sponsorship", d: "Support medical outreach and wellness programs." },
              { t: "Women Sponsorship", d: "Sponsor an entrepreneur or training cohort." },
              { t: "Youth Sponsorship", d: "Sponsor career and leadership development." },
            ].map((s) => (
              <div key={s.t} className="glass rounded-2xl p-6 hover-lift">
                <div className="font-display text-xl">{s.t}</div>
                <p className="text-sm text-white/65 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Method({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex gap-4 hover-lift">
      <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-lg">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
