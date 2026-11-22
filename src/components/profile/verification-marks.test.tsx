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
  it("names the verification badge for assistive technology", () => {
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
            badgeUrl: null,
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Affiliated with Example" }),
    ).not.toBeInTheDocument();
  });

  it("renders no marks for an unverified volunteer without an upload", () => {
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
            badgeUrl: null,
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows an uploaded badge beside the verification mark without an organization", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VerificationMarks
          verification={{
            verified: true,
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
      screen.queryByRole("img", { name: "Affiliated with Example" }),
    ).not.toBeInTheDocument();
  });

  it("shows an uploaded badge on its own, without the verification mark", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VerificationMarks
          verification={{
            verified: false,
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
