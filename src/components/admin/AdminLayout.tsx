import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Images,
  FileText,
  Users,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Camera,
  ListChecks,
  ShieldCheck,
  Newspaper,
  FolderOpen,
  HeartHandshake,
  Calendar,
  Rss,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyAdminStatus } from "@/lib/admin.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

const sections = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/banners", label: "Hero Banners", icon: Images },
  { to: "/admin/content", label: "Pages & Content", icon: FileText },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/programs", label: "Programs", icon: ListChecks },
  { to: "/admin/gallery", label: "Gallery", icon: Camera },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/news", label: "News", icon: Rss },
  { to: "/admin/volunteers", label: "Volunteers", icon: HeartHandshake },
  { to: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
  { to: "/admin/media", label: "Media Library", icon: FolderOpen },
  { to: "/admin/staff", label: "Staff & Roles", icon: ShieldCheck },
  { to: "/admin/donations", label: "Donations", icon: ListChecks },
  { to: "/admin/submissions", label: "Form Inbox", icon: Mail },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const checkAdmin = useServerFn(getMyAdminStatus);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkAdmin(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data && !data.isAdmin) navigate({ to: "/" });
  }, [data, navigate]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white/60 text-sm">
        Loading admin…
      </div>
    );
  }
  if (error || !data?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white/60 text-sm">
        Not authorized.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-ink text-white flex flex-col transition-transform lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img src={logoAsset.url} alt="DMGF" className="h-10 w-10 object-contain bg-transparent" />
          <div>
            <div className="font-display text-sm">DMGF Admin</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sections.map((s) => {
            const active = s.exact ? pathname === s.to : pathname.startsWith(s.to);
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-gold hover:bg-white/5"
          >
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-300 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-border h-14 flex items-center gap-3 px-4 lg:px-6">
          <button
            className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-border"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="text-sm text-muted-foreground">Admin Console</div>
          <div className="ml-auto text-xs text-muted-foreground">{data?.userId?.slice(0, 8)}…</div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
