import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@/lib/use-server-fn";
import { getMyStaffProfile, type StaffRole } from "@/lib/staff.functions";
import { STAFF_MODULES, roleLabel } from "@/lib/staff-access";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

export { roleLabel };

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fn = useServerFn(getMyStaffProfile);
  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data && !data.isStaff && !data.isAdmin) navigate({ to: "/" });
  }, [data, navigate]);
  useEffect(() => setDrawerOpen(false), [pathname]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading)
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white/60 text-sm">
        Loading…
      </div>
    );
  if (error || !data)
    return (
      <div className="min-h-screen grid place-items-center bg-ink text-white/60 text-sm">
        Not authorized.
      </div>
    );

  const roles = data.roles as StaffRole[];
  const visible = STAFF_MODULES.filter(
    (module) => module.roles.some((role) => roles.includes(role)) || data.isAdmin,
  );

  return (
    <div className="min-h-screen bg-cream flex">
      <aside
        className={`fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-ink text-white flex flex-col transition-transform lg:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img src={logoAsset.url} alt="DMGF" className="h-10 w-10 object-contain bg-transparent" />
          <div>
            <div className="font-display text-sm">Staff Portal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">DMGF</div>
          </div>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
            Your roles
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roles.length === 0 && <span className="text-xs text-white/40">No roles assigned</span>}
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 text-[10px] bg-gold/15 text-gold border border-gold/30 px-2 py-1 rounded-full"
              >
                <ShieldCheck className="h-2.5 w-2.5" />
                {roleLabel(r)}
              </span>
            ))}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {visible.map((s) => {
            const active = s.to === "/staff" ? pathname === s.to : pathname.startsWith(s.to);
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-gold/15 text-gold border border-gold/30" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </Link>
            );
          })}
          {data.isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/75 hover:bg-white/5 hover:text-gold"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Console
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-gold hover:bg-white/5"
          >
            <ExternalLink className="h-4 w-4" />
            View site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-300 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-border h-14 flex items-center gap-3 px-4 lg:px-6">
          <button
            className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-border"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="text-sm text-muted-foreground">Staff Portal</div>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {data.userId.slice(0, 8)}…
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
