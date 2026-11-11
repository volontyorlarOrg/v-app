import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/auth/config", () => ({
  apiBaseUrl: () => "https://api.example.org",
  proxySecret: () => undefined,
}));

import { api } from "./client.server";

afterEach(() => vi.unstubAllGlobals());

describe("server API transport", () => {
  it("keeps bearer responses out of persistent caches even if a caller requests caching", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    await api("/me", {
      accessToken: "private-session",
      cache: "force-cache",
      revalidate: 60,
      tags: ["account"],
    });
    expect(fetcher).toHaveBeenCalledOnce();
    const [request, options] = fetcher.mock.calls[0]!;
    expect(request.headers.get("Authorization")).toBe("Bearer private-session");
    expect(options).toEqual({ cache: "no-store" });
  });

  it("preserves explicit caching of anonymous public data", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    await api("/opportunities", { revalidate: 60, tags: ["opportunities"] });
    expect(fetcher.mock.calls[0]![1]).toEqual({
      cache: undefined,
      next: { revalidate: 60, tags: ["opportunities"] },
    });
  });

  it("does not retry or cache mutations after a network failure", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("network failure"));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      api("/auth/password/login", { method: "POST", body: {}, cache: "force-cache" }),
    ).rejects.toMatchObject({ code: "network" });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]![1]).toEqual({ cache: "no-store" });
  });

  it("does not retry a read cancelled by its caller", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher = vi
      .fn()
      .mockRejectedValue(new DOMException("cancelled", "AbortError"));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      api("/opportunities", { signal: controller.signal }),
    ).rejects.toMatchObject({ code: "network" });
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
