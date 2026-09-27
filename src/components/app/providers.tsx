"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    document.documentElement.dataset.appHydrated = "true";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster />
    </QueryClientProvider>
  );
}
