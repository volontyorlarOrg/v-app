import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "./routing";

/**
 * Translation catalogue integrity.
 *
 * The failure this prevents is specific and easy to ship: a key added to
 * English and forgotten in Uzbek renders as a raw key path — `list.emptyTitle`
 * — in front of the audience the product is actually for. Reviewing three
 * files by eye does not catch it; this does.
 */

const MESSAGES_DIR = join(process.cwd(), "src/i18n/messages");
const REFERENCE_LOCALE = "en";

type Catalogue = Record<string, unknown>;

function flatten(value: Catalogue, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    child !== null && typeof child === "object" && !Array.isArray(child)
      ? flatten(child as Catalogue, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function load(locale: string, namespace: string): Catalogue {
  return JSON.parse(
    readFileSync(join(MESSAGES_DIR, locale, `${namespace}.json`), "utf8"),
  ) as Catalogue;
}

const namespaces = readdirSync(join(MESSAGES_DIR, REFERENCE_LOCALE))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""));

/**
 * The ICU *argument* names a message uses, at the top level.
 *
 * A naive `/\{(\w+)/` regex is wrong here: in
 * `{count, plural, one {# event} other {# events}}` the inner braces delimit
 * plural branches, not arguments, and a translation is free to word those
 * branches however its language needs. Only depth-0 braces name real
 * arguments, so the scanner tracks nesting and reads identifiers there.
 */
function icuArguments(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;

  for (let index = 0; index < message.length; index += 1) {
    const char = message[index];

    if (char === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (char !== "{") continue;

    if (depth === 0) {
      const identifier = /^\{\s*(\w+)\s*[,}]/.exec(message.slice(index));
      if (identifier) names.add(identifier[1]!);
    }

    depth += 1;
  }

  return [...names].sort();
}

describe("message catalogues", () => {
  it("defines at least one namespace to check", () => {
    expect(namespaces.length).toBeGreaterThan(0);
  });

  it.each(locales)("locale %s has every namespace file", (locale) => {
    const present = readdirSync(join(MESSAGES_DIR, locale))
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""))
      .sort();

    expect(present).toEqual([...namespaces].sort());
  });

  describe.each(namespaces)("namespace %s", (namespace) => {
    const reference = flatten(load(REFERENCE_LOCALE, namespace)).sort();

    it.each(locales.filter((locale) => locale !== REFERENCE_LOCALE))(
      "%s has exactly the same keys as the reference locale",
      (locale) => {
        expect(flatten(load(locale, namespace)).sort()).toEqual(reference);
      },
    );

    it.each(locales)("%s has no empty strings", (locale) => {
      const catalogue = load(locale, namespace);
      const empty: string[] = [];

      const walk = (value: Catalogue, prefix = "") => {
        for (const [key, child] of Object.entries(value)) {
          if (typeof child === "string" && child.trim() === "") {
            empty.push(`${prefix}${key}`);
          } else if (child !== null && typeof child === "object") {
            walk(child as Catalogue, `${prefix}${key}.`);
          }
        }
      };

      walk(catalogue);
      expect(empty).toEqual([]);
    });

    it.each(locales.filter((locale) => locale !== REFERENCE_LOCALE))(
      "%s uses the same ICU arguments as the reference",
      (locale) => {
        // A translation that drops `{count}` renders a sentence with a hole in
        // it; one that invents an argument throws at render time.
        const args = (catalogue: Catalogue) => {
          const found = new Map<string, string[]>();

          const walk = (value: Catalogue, prefix = "") => {
            for (const [key, child] of Object.entries(value)) {
              if (typeof child === "string") {
                found.set(`${prefix}${key}`, icuArguments(child));
              } else if (child !== null && typeof child === "object") {
                walk(child as Catalogue, `${prefix}${key}.`);
              }
            }
          };

          walk(catalogue);
          return found;
        };

        const expected = args(load(REFERENCE_LOCALE, namespace));
        const actual = args(load(locale, namespace));

        for (const [key, names] of expected) {
          expect({ key, names: actual.get(key) }).toEqual({ key, names });
        }
      },
    );
  });
});
