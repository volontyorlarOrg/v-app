import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RollingNumber } from "@/components/motion/rolling-number";

describe("RollingNumber", () => {
  it("keeps the figure readable as one string and hides the moving strips", () => {
    const { container } = render(<RollingNumber value="1,240" />);
    expect(screen.getByText("1,240")).toHaveClass("sr-only");
    expect(container.querySelector(".rolling-number-track")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("gives every digit a strip that rests on its own value, in reading order", () => {
    const { container } = render(<RollingNumber value="1,240" />);
    const digits = [...container.querySelectorAll<HTMLElement>(".rolling-digit")];
    expect(digits).toHaveLength(4);
    expect(digits.map((digit) => digit.style.getPropertyValue("--digit"))).toEqual([
      "1",
      "2",
      "4",
      "0",
    ]);
    expect(digits[3]?.style.getPropertyValue("--order")).toBe("3");
    expect(digits[1]?.querySelector(".rolling-digit-final")?.textContent).toBe("2");
    expect(digits[1]?.querySelectorAll(".rolling-digit-strip > span")).toHaveLength(10);
  });

  it("leaves separators and signs as plain characters", () => {
    const { container } = render(<RollingNumber value="83 %" />);
    expect(container.querySelectorAll(".rolling-digit")).toHaveLength(2);
    expect(container.querySelector(".rolling-number-track")?.textContent).toContain(
      " %",
    );
  });
});
