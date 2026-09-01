"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isApiError } from "@/lib/api/errors";

/**
 * The one QueryClient provider.
 *
 * Deliberately narrow scope: TanStack Query owns *client-dynamic* server state
 * — filter results fetched after the first paint, a saved-state toggle, an
 * application list that refreshes after a mutation. It does not own initial
 * page data. Server Components fetch that, and duplicating it into a query on
 * mount would mean every page pays for a second round trip to display what it
 * already rendered.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Created in state, not at module scope: a module-level client would be
  // shared across requests on the server and leak one user's cache to another.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Volunteer workflows tolerate half-minute-old data comfortably.
            // Anything shorter buys refetches nobody asked for.
            staleTime: 30_000,
            gcTime: 5 * 60_000,

            // Refetching on every tab focus is the classic refetch storm on
            // mobile, where switching to Telegram and back is constant.
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,

            retry(failureCount, error) {
              // Retrying a 401/403/404/409 just repeats a decided answer.
              if (isApiError(error) && !error.isRetryable) return false;
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
          },
          mutations: {
            // A mutation retried automatically can double-submit an
            // application. Retrying is the user's decision.
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
