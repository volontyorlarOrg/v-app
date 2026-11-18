import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { VerificationMarks } from "./verification-marks";

describe("VerificationMarks", () => {
  it("names the badge and affiliation for assistive technology", () => {
    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          verification: { verified: "Verified", affiliation: "Affiliated with {name}" },
        }}
      >
        <VerificationMarks
          verification={{
            verified: true,
            organization: { id: "org", name: "Example", logoUrl: null },
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
          verification: { verified: "Verified", affiliation: "Affiliated with {name}" },
        }}
      >
        <VerificationMarks
          verification={{
            verified: false,
            organization: { id: "org", name: "Example", logoUrl: null },
          }}
        />
      </NextIntlClientProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
