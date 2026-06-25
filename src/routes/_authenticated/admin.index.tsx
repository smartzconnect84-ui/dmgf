import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListBanners, adminListSubmissions, adminListTeam } from "@/lib/cms.functions";
import { Images, Mail, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const lb = useServerFn(adminListBanners);
  const ls = useServerFn(adminListSubmissions);
  const lt = useServerFn(adminListTeam);
  const banners = useQuery({ queryKey: ["adm", "banners"], queryFn: () => lb() });
  const subs = useQuery({ queryKey: ["adm", "subs"], queryFn: () => ls() });
  const team = useQuery({ queryKey: ["adm", "team"], queryFn: () => lt() });

  const stats = [
    { label: "Hero Banners", value: banners.data?.length ?? 0, to: "/admin/banners", icon: Images },
    { label: "Team Members", value: team.data?.length ?? 0, to: "/admin/team", icon: Users },
    { label: "New Submissions", value: subs.data?.filter((s) => !s.is_read).length ?? 0, to: "/admin/submissions", icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Manage your site content, banners, and form submissions.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group bg-white rounded-2xl border border-border p-5 hover:border-gold hover:shadow-md transition">
            <s.icon className="h-5 w-5 text-gold mb-3" />
            <div className="font-display text-3xl">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              {s.label} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-display text-xl mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/admin/banners" className="px-4 py-3 rounded-lg bg-ink text-white text-sm hover:bg-gold hover:text-ink transition">Edit hero banners</Link>
          <Link to="/admin/content" className="px-4 py-3 rounded-lg bg-ink text-white text-sm hover:bg-gold hover:text-ink transition">Edit page content</Link>
          <Link to="/admin/team" className="px-4 py-3 rounded-lg bg-ink text-white text-sm hover:bg-gold hover:text-ink transition">Manage team</Link>
          <Link to="/admin/settings" className="px-4 py-3 rounded-lg bg-ink text-white text-sm hover:bg-gold hover:text-ink transition">Site settings</Link>
        </div>
      </div>
    </div>
  );
}
