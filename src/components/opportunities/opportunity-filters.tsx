"use client";

import { MapPin, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useId, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SwitchControl } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import { parseOpportunityFilters } from "@/lib/opportunities/filters";
import {
  opportunityFilterParsers,
  opportunityViewParser,
  toFilterState,
} from "@/lib/opportunities/search-params";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export type KindLink = { key: string; label: string; href: string; active: boolean };

export type FilterLabels = {
  legend: string;
  search: string;
  searchPlaceholder: string;
  kinds: string;
  region: string;
  regionAny: string;
  savedOnly: string;
  clear: string;
};

const toolbarParsers = { ...opportunityFilterParsers, view: opportunityViewParser };

export function OpportunityFilters({
  action,
  labels,
  kinds,
  regions,
  hiddenValues = [],
  clearHref,
  activeCount,
}: {
  action: string;
  labels: FilterLabels;
  kinds: readonly KindLink[];
  regions: readonly FilterOption[];
  hiddenValues?: readonly { name: string; value: string }[];
  clearHref: string;
  activeCount: number;
}) {
  const savedId = useId();
  const [filters, setFilters] = useQueryStates(toolbarParsers, {
    shallow: false,
    history: "push",
    scroll: false,
  });
  const savedOnly = filters.view === "saved";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params: Record<string, string> = {};
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string") params[key] = value;
    }
    void setFilters(toFilterState(parseOpportunityFilters(params)));
  }

  return (
    <form
      method="get"
      action={action}
      onSubmit={onSubmit}
      aria-label={labels.legend}
      className="flex flex-wrap items-center gap-3"
    >
      {hiddenValues.map((hidden) => (
        <input
          key={hidden.name}
          type="hidden"
          name={hidden.name}
          value={hidden.value}
        />
      ))}
      {savedOnly ? <input type="hidden" name="view" value="saved" /> : null}

      <div className="relative w-full lg:w-auto lg:min-w-48 lg:flex-1">
        <label htmlFor="filter-q" className="sr-only">
          {labels.search}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          key={filters.q}
          id="filter-q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder={labels.searchPlaceholder}
          className="min-h-11 pl-11 text-sm"
        />
      </div>

      <nav
        aria-label={labels.kinds}
        className="flex min-h-11 w-full gap-1 rounded-lg border border-border bg-surface p-0.5 sm:w-auto"
      >
        {kinds.map((kind) => (
          <Link
            key={kind.key}
            href={kind.href}
            scroll={false}
            aria-current={kind.active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-none",
              kind.active
                ? "bg-action text-knockout"
                : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
            )}
          >
            {kind.label}
          </Link>
        ))}
      </nav>

      <div className="relative min-w-40 flex-1 sm:w-48 sm:flex-none">
        <label htmlFor="filter-region" className="sr-only">
          {labels.region}
        </label>
        <MapPin
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-primary"
        />
        <NativeSelect
          id="filter-region"
          name="region"
          value={filters.region ?? ""}
          onChange={(event) =>
            void setFilters({
              region: parseOpportunityFilters({ region: event.target.value }).region,
            })
          }
          className="min-h-11 pl-10 text-sm"
        >
          <NativeSelectOption value="">{labels.regionAny}</NativeSelectOption>
          {regions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex items-center gap-2.5">
        <SwitchControl
          id={savedId}
          checked={savedOnly}
          onCheckedChange={(next) => void setFilters({ view: next ? "saved" : null })}
          aria-labelledby={`${savedId}-label`}
        />
        <label
          id={`${savedId}-label`}
          htmlFor={savedId}
          className="text-sm font-semibold whitespace-nowrap text-ink"
        >
          {labels.savedOnly}
        </label>
      </div>

      {activeCount > 0 ? (
        <Button asChild variant="ghost" size="sm">
          <Link href={clearHref}>{labels.clear}</Link>
        </Button>
      ) : null}
    </form>
  );
}
