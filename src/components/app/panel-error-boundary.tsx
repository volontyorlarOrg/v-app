"use client";

import { Component, type ReactNode } from "react";

import { LoadErrorPanel, type LoadErrorLabels } from "@/components/app/load-error";
import { buttonClass } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

const RENDER_FAILURE = {
  code: "server",
  reason: "failed",
  retryable: false,
  reference: null,
} as const;

type BoundaryProps = {
  labels: LoadErrorLabels;
  onRetry: () => void;
  children: ReactNode;
};

type BoundaryState = { failed: boolean };

class Boundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.error("[panel] a section failed to render", error);
  }

  retry = () => {
    this.setState({ failed: false });
    this.props.onRetry();
  };

  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <LoadErrorPanel
        failure={RENDER_FAILURE}
        labels={this.props.labels}
        action={
          <button
            type="button"
            onClick={this.retry}
            className={buttonClass({ size: "sm" })}
          >
            {this.props.labels.retry}
          </button>
        }
      />
    );
  }
}

export function PanelErrorBoundary({
  labels,
  children,
}: {
  labels: LoadErrorLabels;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Boundary labels={labels} onRetry={() => router.refresh()}>
      {children}
    </Boundary>
  );
}
