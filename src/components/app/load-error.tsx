import type { ReactNode } from "react";

import { Panel } from "@/components/app/panel";

export type LoadErrorLabels = { title: string; body: string; retry: string };

export function LoadErrorPanel({
  labels,
  action,
}: {
  labels: LoadErrorLabels;
  action: ReactNode;
}) {
  return (
    <div role="alert" className="mx-auto mt-6 w-full max-w-lg">
      <Panel className="text-center">
        <p className="text-lg font-semibold text-ink">{labels.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{labels.body}</p>
        <div className="mt-5 flex justify-center">{action}</div>
      </Panel>
    </div>
  );
}
