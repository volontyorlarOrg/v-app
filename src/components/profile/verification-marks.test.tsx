import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { VerificationMarks } from "./verification-marks";

const messages = {
  verification: {
    verified: "Verified",
    affiliation: "Affiliated with {name}",
    customBadge: "Custom badge",
  },
};

describe("VerificationMarks", () => {
  it("names the badge and affiliation for assistive technology", () => {
    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          verification: {
            verified: "Verified",
            affiliation: "Affiliated with {name}",
            customBadge: "Custom badge",
          },
        }}
      >
        <VerificationMarks
          verification={{
            verified: true,
            organization: { id: "org", name: "Example", logoUrl: null },
            badgeUrl: null,
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Affiliated with Example" }),
    ).toBeInTheDocument();
  });

  it("shows an organization only beside the verification badge", () => {
    const { container } = render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          verification: {
            verified: "Verified",
            affiliation: "Affiliated with {name}",
            customBadge: "Custom badge",
          },
        }}
      >
        <VerificationMarks
          verification={{
            verified: false,
            organization: { id: "org", name: "Example", logoUrl: null },
            badgeUrl: null,
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows an uploaded badge beside the verification mark and the organization", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VerificationMarks
          verification={{
            verified: true,
            organization: { id: "org", name: "Example", logoUrl: null },
            badgeUrl: "https://cdn.example/badges/user/badge.webp",
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Custom badge" })).toHaveAttribute(
      "src",
      "https://cdn.example/badges/user/badge.webp",
    );
    expect(
      screen.getByRole("img", { name: "Affiliated with Example" }),
    ).toBeInTheDocument();
  });

  it("shows an uploaded badge on its own, without the verification mark", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VerificationMarks
          verification={{
            verified: false,
            organization: { id: "org", name: "Example", logoUrl: null },
            badgeUrl: "https://cdn.example/badges/user/badge.webp",
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("img", { name: "Custom badge" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Verified" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Affiliated with Example" }),
    ).not.toBeInTheDocument();
  });
});
