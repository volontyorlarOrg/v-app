import { describe, expect, it } from "vitest";

import { opportunityImageUrl } from "./image";

describe("opportunityImageUrl", () => {
  it("accepts storage and same-origin image paths", () => {
    expect(opportunityImageUrl("https://media.example.org/photo.webp")).toBe(
      "https://media.example.org/photo.webp",
    );
    expect(opportunityImageUrl("/logo/social/og-image-1200x630.png")).toBe(
      "/logo/social/og-image-1200x630.png",
    );
  });

  it("rejects script, data and protocol-relative URLs", () => {
    expect(opportunityImageUrl("javascript:alert(1)")).toBeNull();
    expect(opportunityImageUrl("data:image/svg+xml,evil")).toBeNull();
    expect(opportunityImageUrl("//other.example.org/photo.webp")).toBeNull();
  });
});
