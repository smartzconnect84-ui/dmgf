import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { fetchContentBlocks } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";
import { useServerFn } from "@tanstack/react-start";
import { submitForm } from "@/lib/cms.functions";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    try {
      return await fetchContentBlocks({ data: { page: "contact" } });
    } catch {
      return {} as Record<string, string>;
    }
  },
  head: ({ loaderData }) => {
    const cb = (loaderData as Record<string, string>) || {};
    const title = cb.seo_title || "Contact · DMGF";
    const description =
      cb.seo_description ||
      "Reach the Deesire Moore Grace Foundation team in Monrovia, Liberia. Office hours, email, phone numbers and WhatsApp.";
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
  component: Contact,
});

function Contact() {
  const { data: cb } = useQuery({
    queryKey: ["pub", "content", "contact"],
    queryFn: () => fetchContentBlocks({ data: { page: "contact" } }),
  });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const submit = useServerFn(submitForm);
  const whatsApp = `https://wa.me/${site.phones[2].replace(/[^\d]/g, "")}`;
  return (
    <>
      <PageHero
        eyebrow={t("hero_eyebrow", "Get in Touch")}
        title={
          <>
            {t("hero_title_prefix", "We'd love to ")}
            <span className="text-gradient-gold">
              {t("hero_title_highlight", "hear from you.")}
            </span>
          </>
        }
        subtitle={t(
          "intro",
          "We would love to hear from you. Reach out for partnerships, volunteering, or general inquiries.",
        )}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-5 gap-10">
          <aside className="lg:col-span-2 space-y-5">
            <Info icon={MapPin} title="Headquarters">
              {site.address}
            </Info>
            <Info icon={Clock} title="Office Hours">
              {site.hours}
            </Info>
            <Info icon={Mail} title="Email">
              <a href={`mailto:${site.email}`} className="hover:text-gold-deep">
                {site.email}
              </a>
            </Info>
            <Info icon={Phone} title="Phone">
              {site.phones.map((p) => (
                <div key={p}>
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-gold-deep">
                    {p}
                  </a>
                </div>
              ))}
            </Info>
            <a
              href={whatsApp}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-ink text-white p-5 flex items-center gap-4 hover:bg-gold hover:text-ink transition"
            >
              <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-lg">
                  {t("whatsapp_title", "Chat on WhatsApp")}
                </div>
                <div className="text-sm opacity-80">
                  {t("whatsapp_sub", "Typical reply within hours")}
                </div>
              </div>
            </a>
          </aside>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await submit({
                  data: {
                    kind: "contact",
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    subject: String(fd.get("subject") || ""),
                    message: String(fd.get("message") || ""),
                  },
                });
                alert(t("form_success", "Message sent. We'll be in touch shortly."));
                e.currentTarget.reset();
              } catch (err) {
                alert((err as Error).message);
              }
            }}
            className="lg:col-span-3 rounded-3xl border bg-card p-8 lg:p-10 shadow-elegant"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">
              {t("form_eyebrow", "Send a message")}
            </div>
            <h2 className="font-display text-3xl mb-6">{t("form_heading", "How can we help?")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" />
              <Field label="Subject" name="subject" />
            </div>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">Message</label>
              <textarea
                name="message"
                rows={6}
                required
                className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold"
              />
            </div>
            <button className="btn-fx mt-6 inline-flex items-center justify-center gap-2 bg-ink text-white py-3.5 px-8 rounded-full hover:bg-gold hover:text-ink transition font-medium">
              {t("form_submit", "Send message")}
            </button>
          </form>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="rounded-3xl overflow-hidden border shadow-elegant aspect-[16/9]">
            <iframe
              title="DMGF location"
              src="https://www.google.com/maps?q=Congo+Town+Monrovia+Liberia&output=embed"
              loading="lazy"
              className="w-full h-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Info({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex gap-4">
      <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{title}</div>
        <div className="font-display text-lg mt-0.5 text-foreground">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold"
      />
    </div>
  );
}
