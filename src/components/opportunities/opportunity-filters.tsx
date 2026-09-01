"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useDeferredValue, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { FILTER_PARAMS } from "@/features/opportunities/filters";
import {
  OPPORTUNITY_FORMATS,
  OPPORTUNITY_SORTS,
  REGIONS,
} from "@/features/opportunities/schemas";

/**
 * Opportunity filters, backed entirely by the URL.
 *
 * There is no local mirror of the filter state. That is deliberate: the moment
 * filters live in `useState`, `/uz/opportunities?region=samarkand` stops being
 * a real address, and the links people paste into Telegram — the product's
 * main distribution channel — stop reproducing what the sender saw.
 *
 * The one exception is the search box, which keeps a local value so typing
 * feels immediate; it is pushed to the URL on a debounce.
 */

const parsers = {
  [FILTER_PARAMS.q]: parseAsString.withDefault(""),
  [FILTER_PARAMS.region]: parseAsStringLiteral(REGIONS),
  [FILTER_PARAMS.format]: parseAsStringLiteral(OPPORTUNITY_FORMATS),
  [FILTER_PARAMS.openOnly]: parseAsBoolean.withDefault(false),
  [FILTER_PARAMS.sort]: parseAsStringLiteral(OPPORTUNITY_SORTS).withDefault(
    "deadline",
  ),
  [FILTER_PARAMS.page]: parseAsInteger.withDefault(1),
};

const SEARCH_DEBOUNCE_MS = 350;

export function OpportunityFiltersBar({ resultCount }: { resultCount: number }) {
  const t = useTranslations("opportunities");
  const common = useTranslations("common");

  const [filters, setFilters] = useQueryStates(parsers, {
    // The listing is a Server Component, so a filter change has to re-run the
    // server render rather than only updating the URL.
    shallow: false,
    // Filtering replaces the current view rather than stacking history
    // entries; otherwise Back walks through every keystroke.
    history: "replace",
  });

  const urlQuery = filters[FILTER_PARAMS.q];

  const [search, setSearch] = useState(urlQuery);
  const deferredSearch = useDeferredValue(search);

  /**
   * Re-sync the box when the URL changes from somewhere else — Back, a pasted
   * link, "clear filters".
   *
   * Adjusted during render rather than in an effect. An effect here would set
   * state on every URL change and cascade a second render on each keystroke's
   * round trip; this pattern re-renders once, immediately, before anything is
   * painted.
   */
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setSearch(urlQuery);
  }

  useEffect(() => {
    if (deferredSearch === urlQuery) return;

    const timer = setTimeout(() => {
      void setFilters({
        [FILTER_PARAMS.q]: deferredSearch || null,
        [FILTER_PARAMS.page]: null,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [deferredSearch, urlQuery, setFilters]);

  /** Any filter change resets to page 1 — see `withFilterChange`. */
  function update(next: Partial<Record<string, string | boolean | null>>) {
    void setFilters({ ...next, [FILTER_PARAMS.page]: null });
  }

  const activeCount =
    (filters[FILTER_PARAMS.q].trim() ? 1 : 0) +
    (filters[FILTER_PARAMS.region] ? 1 : 0) +
    (filters[FILTER_PARAMS.format] ? 1 : 0) +
    (filters[FILTER_PARAMS.openOnly] ? 1 : 0);

  function clearAll() {
    setSearch("");
    void setFilters({
      [FILTER_PARAMS.q]: null,
      [FILTER_PARAMS.region]: null,
      [FILTER_PARAMS.format]: null,
      [FILTER_PARAMS.openOnly]: null,
      [FILTER_PARAMS.page]: null,
    });
  }

  return (
    <section
      // A fieldset would be more semantic, but its legend cannot be styled
      // reliably across browsers; an explicitly labelled region is equivalent
      // for assistive technology and does not fight the layout.
      aria-label={t("filters.legend")}
      className="flex flex-col gap-4"
    >
      <Field label={t("filters.search")}>
        {(field) => (
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <Input
              {...field}
              type="search"
              inputMode="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="pl-9"
            />
          </div>
        )}
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("filters.region")}>
          {(field) => (
            <Select
              {...field}
              value={filters[FILTER_PARAMS.region] ?? ""}
              onChange={(event) =>
                update({ [FILTER_PARAMS.region]: event.target.value || null })
              }
            >
              <option value="">{t("filters.regionAny")}</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {t(`regions.${region}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={t("filters.format")}>
          {(field) => (
            <Select
              {...field}
              value={filters[FILTER_PARAMS.format] ?? ""}
              onChange={(event) =>
                update({ [FILTER_PARAMS.format]: event.target.value || null })
              }
            >
              <option value="">{t("filters.formatAny")}</option>
              {OPPORTUNITY_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {t(`format.${format}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={t("filters.sort")}>
          {(field) => (
            <Select
              {...field}
              value={filters[FILTER_PARAMS.sort]}
              onChange={(event) =>
                update({ [FILTER_PARAMS.sort]: event.target.value })
              }
            >
              {OPPORTUNITY_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t(`sort.${sort}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={filters[FILTER_PARAMS.openOnly]}
            onChange={(event) =>
              update({ [FILTER_PARAMS.openOnly]: event.target.checked || null })
            }
            className="size-4 accent-[var(--color-teal)]"
          />
          {t("status.anyOpen")}
        </label>

        {activeCount > 0 ? (
          <>
            <Badge tone="signalQuiet" icon={<SlidersHorizontal aria-hidden="true" />}>
              {t("filters.applied", { count: activeCount })}
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X aria-hidden="true" className="size-4" />
              {common("action.clearFilters")}
            </Button>
          </>
        ) : null}

        {/*
          Announces the new count after a filter change. Without this a screen
          reader user changes a filter and hears nothing at all.
        */}
        <p role="status" aria-live="polite" className="ml-auto text-sm text-muted">
          {t("list.resultCount", { count: resultCount })}
        </p>
      </div>
    </section>
  );
}
