"use client";

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from "lucide-react";
import { useSyncExternalStore, type CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { readTheme, subscribeToTheme, type Theme } from "@/lib/theme";

const SERVER_THEME: Theme = "light";

function Toaster(props: ToasterProps) {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => SERVER_THEME);

  return (
    <Sonner
      theme={theme}
      position="top-center"
      offset={{ top: "4.5rem" }}
      mobileOffset={{ top: "4.5rem" }}
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />,
        loading: <LoaderCircle className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-popover)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-lg)",
          fontFamily: "var(--)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: " text-sm font-medium",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
