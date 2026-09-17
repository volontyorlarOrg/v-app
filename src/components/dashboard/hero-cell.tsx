import type { ReactNode } from "react";

import { PanelAction } from "@/components/app/panel";

export function HeroCell({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="dashboard-hero-cell">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 self-start">
        <h2 id={`${id}-title`} className="font-sans text-base font-semibold text-ink">
          {title}
        </h2>
        <PanelAction href={action.href} label={action.label} />
      </header>
      {children}
    </section>
  );
}
