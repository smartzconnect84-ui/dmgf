import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatAssistant } from "../components/ChatAssistant";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="font-display text-gradient-gold text-8xl">404</h1>
        <h2 className="mt-4 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-white/60">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="btn-fx inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-medium text-ink">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-white/60">Please try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-ink">Try again</button>
          <a href="/" className="rounded-full border border-gold/40 px-5 py-2">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isChromeless = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname === "/reset-password";

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (searchParams.get("type") === "recovery" || hashParams.get("type") === "recovery") {
      void router.navigate({ to: "/reset-password", search: { recovery: true } });
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") void router.navigate({ to: "/reset-password", search: { recovery: true } });
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {!isChromeless && <Header />}
      <main className={isChromeless ? "" : "min-h-screen bg-background"}><Outlet /></main>
      {!isChromeless && <Footer />}
      {!isChromeless && <ChatAssistant />}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
