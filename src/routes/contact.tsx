import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { fetchContentBlocks } from "@/lib/site-data.functions";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · DMGF" },
      { name: "description", content: "Reach the Deesire Moore Grace Foundation team in Monrovia, Liberia. Office hours, email, phone numbers and WhatsApp." },
      { property: "og:title", content: "Contact DMGF" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: cb } = useQuery({ queryKey: ["pub", "content", "contact"], queryFn: () => fetchContentBlocks({ data: { page: "contact" } }) });
  const t = (k: string, fb: string) => (cb && cb[k]) || fb;
  const whatsApp = `https://wa.me/${site.phones[2].replace(/[^\d]/g, "")}`;
  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={<>We'd love to <span className="text-gradient-gold">hear from you.</span></>}
        subtitle={t("intro", "We would love to hear from you. Reach out for partnerships, volunteering, or general inquiries.")}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-5 gap-10">
          <aside className="lg:col-span-2 space-y-5">
            <Info icon={MapPin} title="Headquarters">{site.address}</Info>
            <Info icon={Clock} title="Office Hours">{site.hours}</Info>
            <Info icon={Mail} title="Email"><a href={`mailto:${site.email}`} className="hover:text-gold-deep">{site.email}</a></Info>
            <Info icon={Phone} title="Phone">
              {site.phones.map((p) => <div key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-gold-deep">{p}</a></div>)}
            </Info>
            <a href={whatsApp} target="_blank" rel="noreferrer" className="rounded-2xl bg-ink text-white p-5 flex items-center gap-4 hover:bg-gold hover:text-ink transition">
              <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-lg">Chat on WhatsApp</div>
                <div className="text-sm opacity-80">Typical reply within hours</div>
              </div>
            </a>
          </aside>

          <form
            onSubmit={(e) => { e.preventDefault(); alert("Message sent. We'll be in touch shortly."); }}
            className="lg:col-span-3 rounded-3xl border bg-card p-8 lg:p-10 shadow-elegant"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-3">Send a message</div>
            <h2 className="font-display text-3xl mb-6">How can we help?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" />
              <Field label="Subject" name="subject" />
            </div>
            <div className="mt-4">
              <label className="text-sm text-muted-foreground">Message</label>
              <textarea rows={6} required className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold" />
            </div>
            <button className="btn-fx mt-6 inline-flex items-center justify-center gap-2 bg-ink text-white py-3.5 px-8 rounded-full hover:bg-gold hover:text-ink transition font-medium">
              Send message
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

function Info({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex gap-4">
      <span className="h-11 w-11 grid place-items-center rounded-full bg-gradient-gold text-ink shrink-0"><Icon className="h-5 w-5" /></span>
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{title}</div>
        <div className="font-display text-lg mt-0.5 text-foreground">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm text-muted-foreground">{label}</label>
      <input id={name} name={name} type={type} required={required}
        className="btn-fx mt-1.5 w-full rounded-xl border border-input bg-white px-4 py-3 outline-none focus:border-gold" />
    </div>
  );
}
