import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyStaffProfile, type StaffRole } from "@/lib/staff.functions";
import { roleLabel } from "@/components/staff/StaffLayout";
import { DollarSign, Mail, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/")({
  component: StaffIndex,
});

const moduleByRole: Record<StaffRole, { to: string; label: string; icon: typeof DollarSign; desc: string }[]> = {
  admin: [{ to: "/admin", label: "Admin Console", icon: ShieldCheck, desc: "Full site control" }],
  ceo: [
    { to: "/staff/donations", label: "Donations", icon: DollarSign, desc: "View all giving" },
    { to: "/staff/submissions", label: "Inbox", icon: Mail, desc: "Form submissions" },
    { to: "/staff/team", label: "Team", icon: ShieldCheck, desc: "Manage leadership profiles" },
  ],
  financial_director: [{ to: "/staff/donations", label: "Donations", icon: DollarSign, desc: "Record & manage giving" }],
  communication_director: [
    { to: "/staff/submissions", label: "Inbox", icon: Mail, desc: "Contact + volunteer forms" },
    { to: "/staff/banners", label: "Hero Banners", icon: ShieldCheck, desc: "Homepage slides" },
    { to: "/staff/content", label: "Page Content", icon: ShieldCheck, desc: "Edit page text" },
    { to: "/staff/settings", label: "Site Settings", icon: ShieldCheck, desc: "Contact, logo & socials" },
  ],
  brand_ambassador: [{ to: "/staff/submissions", label: "Volunteer Sign-ups", icon: Mail, desc: "Read volunteer interest" }],
  program_director: [],
  global_director: [],
  volunteer: [],
};

function StaffIndex() {
  const fn = useServerFn(getMyStaffProfile);
  const { data } = useQuery({ queryKey: ["staff-profile"], queryFn: () => fn(), staleTime: 60_000 });
  const roles = (data?.roles ?? []) as StaffRole[];
  const cards = Array.from(new Map(roles.flatMap((r) => moduleByRole[r] ?? []).map((m) => [m.to, m])).values());

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-gold/80 mb-2">Welcome</div>
        <h1 className="font-display text-3xl mb-2">Your staff dashboard</h1>
        <p className="text-sm text-muted-foreground">Modules below are scoped to your assigned role(s).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <span key={r} className="inline-flex items-center gap-1.5 text-xs bg-ink text-gold border border-gold/30 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3 w-3" />{roleLabel(r)}
          </span>
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
          You don't have any modules assigned yet. Contact an administrator.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="group bg-white rounded-2xl border border-border p-5 hover:border-gold hover:shadow-md transition">
              <c.icon className="h-5 w-5 text-gold mb-3" />
              <div className="font-display text-lg">{c.label}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                {c.desc} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-display text-lg mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-gold" />Security</h2>
        <p className="text-sm text-muted-foreground mb-4">Change your sign-in password from the Account page.</p>
        <Link to="/staff/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-white text-sm hover:bg-gold hover:text-ink transition">
          Manage account <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
