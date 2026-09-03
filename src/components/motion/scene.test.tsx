import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Scene, SplitWords } from "@/components/motion/scene";

describe("SplitWords", () => {
  it("keeps the heading readable as one string", () => {
    render(
      <h2>
        <SplitWords text="Find your next event" />
      </h2>,
    );
    expect(
      screen.getByRole("heading", { name: "Find your next event" }),
    ).toBeInTheDocument();
  });

  it("gives every word its own masked slot and stagger index", () => {
    const { container } = render(
      <p>
        <SplitWords text="Fargʻona va Toshkent" />
      </p>,
    );
    const words = container.querySelectorAll<HTMLElement>(".scene-word");
    expect(words).toHaveLength(3);
    expect(words[0]?.textContent).toBe("Fargʻona");
    expect(words[2]?.style.getPropertyValue("--i")).toBe("2");
  });
});

describe("Scene", () => {
  it("marks an observation boundary that starts un-entered", () => {
    const { container } = render(
      <Scene as="ul" variant="stagger">
        <li>one</li>
      </Scene>,
    );
    const scene = container.querySelector("ul");
    expect(scene).toHaveAttribute("data-scene");
    expect(scene).not.toHaveAttribute("data-in");
    expect(scene).toHaveClass("scene-stagger");
  });

  it("rises as a block by default and passes other attributes through", () => {
    const { container } = render(
      <Scene role="list" className="mt-4">
        <span>copy</span>
      </Scene>,
    );
    const scene = container.querySelector("[data-scene]");
    expect(scene).toHaveClass("scene-rise", "mt-4");
    expect(scene).toHaveAttribute("role", "list");
  });
});
