import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatAssistant } from "../components/ChatAssistant";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink text-white px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-display">Page not found</h2>
        <p className="mt-2 text-sm text-white/60">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-fx inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-medium text-ink"
          >
            Go home
          </Link>
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
    <div className="flex min-h-screen items-center justify-center bg-ink text-white px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-white/60">Please try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-ink"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-gold/40 px-5 py-2 text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DMGF · Deesire Moore Grace Foundation — Hope, Empowerment, Impact in Liberia" },
      {
        name: "description",
        content:
          "Deesire Moore Grace Foundation empowers women, youth and children across Liberia through education, healthcare, livelihoods and advocacy. Donate or volunteer today.",
      },
      { name: "author", content: "Deesire Moore Grace Foundation" },
      { name: "theme-color", content: "#000000" },
      {
        property: "og:title",
        content: "DMGF · Deesire Moore Grace Foundation — Hope, Empowerment, Impact in Liberia",
      },
      {
        property: "og:description",
        content:
          "Deesire Moore Grace Foundation empowers women, youth and children across Liberia through education, healthcare, livelihoods and advocacy. Donate or volunteer today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "DMGF · Deesire Moore Grace Foundation — Hope, Empowerment, Impact in Liberia",
      },
      {
        name: "twitter:description",
        content:
          "Deesire Moore Grace Foundation empowers women, youth and children across Liberia through education, healthcare, livelihoods and advocacy. Donate or volunteer today.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b60072af-4bb9-413c-8c64-dd17786a1955",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b60072af-4bb9-413c-8c64-dd17786a1955",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChromeless =
    pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname === "/reset-password";

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (searchParams.get("type") === "recovery" || hashParams.get("type") === "recovery") {
      void router.navigate({ to: "/reset-password", search: { recovery: true } });
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        void router.navigate({ to: "/reset-password", search: { recovery: true } });
      }
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {!isChromeless && <Header />}
      <main className={isChromeless ? "" : "min-h-screen bg-background"}>
        <Outlet />
      </main>
      {!isChromeless && <Footer />}
      {!isChromeless && <ChatAssistant />}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
