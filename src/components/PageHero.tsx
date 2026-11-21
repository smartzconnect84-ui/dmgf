import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-28 bg-ink text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-ink opacity-90" />
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gold/15 blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-5 lg:px-10 text-center">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.25em] text-gold mb-6 reveal">
            <span className="h-1 w-1 rounded-full bg-gold" /> {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.05] reveal-up">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto reveal-up">{subtitle}</p>
        )}
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 gold-divider" />
    </section>
  );
}
