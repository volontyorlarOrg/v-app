import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Panel({
  id,
  title,
  description,
  action,
  padding = "md",
  className,
  children,
}: {
  id?: string;
  title?: string;
  description?: string;
  action?: { href: string; label: string };
  padding?: "md" | "none";
  className?: string;
  children: ReactNode;
}) {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <Card asChild className={cn("max-w-full min-w-0", className)}>
      <section id={id} aria-labelledby={titleId}>
        {title ? (
          <CardHeader asChild>
            <header>
              <div className="min-w-0">
                <CardTitle asChild>
                  <h2 id={titleId}>{title}</h2>
                </CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
              </div>
              {action ? (
                <CardAction asChild>
                  <Link
                    href={action.href}
                    className="inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
                  >
                    {action.label}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </CardAction>
              ) : null}
            </header>
          </CardHeader>
        ) : null}
        <CardContent className={cn(padding === "none" && "p-0")}>
          {children}
        </CardContent>
      </section>
    </Card>
  );
}
