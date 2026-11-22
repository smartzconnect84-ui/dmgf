import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy · DMGF" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-ink">
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-sm text-ink/70">
        Deesire Moore Grace Foundation ("DMGF") respects your privacy. This policy explains what
        information we collect, how we use it, and your choices.
      </p>
      <h2 className="mt-6 font-display text-xl">Information we collect</h2>
      <p className="mt-2 text-sm text-ink/70">
        We collect information you provide directly, such as contact and volunteer form submissions,
        donation records, and account details for staff members. We also collect basic usage data
        through cookies and similar technologies to operate and improve the site.
      </p>
      <h2 className="mt-6 font-display text-xl">How we use information</h2>
      <p className="mt-2 text-sm text-ink/70">
        We use your information to respond to inquiries, manage programs and events, process
        donations, and communicate with you. We do not sell your personal information.
      </p>
      <h2 className="mt-6 font-display text-xl">Cookies</h2>
      <p className="mt-2 text-sm text-ink/70">
        We use essential cookies to keep the site working and, with your consent, analytics cookies
        to understand site usage. You can accept or decline non-essential cookies via the banner.
      </p>
      <h2 className="mt-6 font-display text-xl">Contact</h2>
      <p className="mt-2 text-sm text-ink/70">
        Questions? Contact us at <a className="text-gold" href="mailto:info24dmgf@gmail.com">info24dmgf@gmail.com</a>.
      </p>
      <div className="mt-8">
        <Link to="/" className="btn-fx inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-medium text-ink">Back home</Link>
      </div>
    </section>
  );
}
