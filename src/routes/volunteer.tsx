import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { fetchContentBlocks } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitForm } from "@/lib/cms.functions";
import { HandHeart, Briefcase, GraduationCap, Users } from "lucide-react";

export const Route = createFileRoute("/volunteer")({
  loader: async () => {
    try { return await fetchContentBlocks({ data: { page: "volunteer" } }); } catch { return {} as Record<string, string>; }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "Volunteer · DMGF";
    const description = cb.seo_description || "Join the DMGF volunteer community in Liberia. Apply for community service, internships, mentorship and outreach roles.";
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
  component: Volunteer,
});

function Volunteer() {
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "volunteer"], queryFn: () => fetchContentBlocks({ data: { page: "volunteer" } }) });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const opportunities = [
    { icon: HandHeart, t: t("opp_1_title", "Community Outreach"), d: t("opp_1_desc", "Join field teams during medical drives, food distributions and home visits.") },
    { icon: GraduationCap, t: t("opp_2_title", "Tutoring & Mentorship"), d: t("opp_2_desc", "Support learners through tutoring, mentorship and life-skills coaching.") },
    { icon: Briefcase, t: t("opp_3_title", "Skilled Professionals"), d: t("opp_3_desc", "Lend medical, legal, financial, design or technology skills pro bono.") },
    { icon: Users, t: t("opp_4_title", "Internship Program"), d: t("opp_4_desc", "University and college internships across operations and programs.") },
  ];
  const submit = useServerFn(submitForm);
  return (
    <>
      <PageHero
        eyebrow={t("hero_eyebrow", "Volunteer · Intern · Serve")}
        title={<>{t("hero_title_prefix", "Give time. ")}<span className="text-gradient-gold">{t("hero_title_highlight", "Give heart.")}</span></>}
        subtitle={t("intro_body", "Lend your time and talent to communities across Liberia.")}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-12 items-start">
          <div className="grid sm:grid-cols-2 gap-5">
            {opportunities.map((o) => (
              <div key={o.t} className="rounded-2xl border bg-card p-6 hover-lift">
                <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink">
                  <o.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl mt-5">{o.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{o.d}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await submit({ data: { kind: "volunteer", name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || ""), subject: String(fd.get("location") || "Volunteer application"), message: String(fd.get("message") || "") } });
                alert(t("success_msg", "Thank you! Our team will reach out within 48 hours."));
                e.currentTarget.reset();
              } catch (err) {
                alert((err as Error).message);
              }
            }}
            className="rounded-3xl border bg-card p-8 shadow-elegant"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">{t("form_eyebrow", "Register as a volunteer")}</div>
            <h2 className="font-display text-3xl mb-6">{t("form_heading", "Tell us about you.")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("label_name", "Full name")} name="name" required />
              <Field label={t("label_email", "Email")} name="email" type="email" required />
              <Field label={t("label_phone", "Phone")} name="phone" />
              <Field label={t("label_location", "Location")} name="location" placeholder={t("placeholder_location", "City, County")} />
            </div>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">{t("label_interest", "Area of interest")}</label>
              <select className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold">
                {opportunities.map((o) => <option key={o.t}>{o.t}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">{t("label_skills", "Skills & availability")}</label>
              <textarea name="message" rows={4} className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold" placeholder={t("placeholder_skills", "Tell us what you can offer and when you're available.")} />
            </div>
            <button className="btn-fx mt-6 w-full inline-flex items-center justify-center gap-2 bg-ink text-white py-3.5 rounded-full hover:bg-gold hover:text-ink transition font-medium">
{t("submit_cta", "Submit application")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm text-muted-foreground">{label}</label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder}
        className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold" />
    </div>
  );
}
