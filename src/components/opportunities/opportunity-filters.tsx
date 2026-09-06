"use client";

import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import { parseOpportunityFilters } from "@/lib/opportunities/filters";
import {
  opportunityFilterParsers,
  toFilterState,
} from "@/lib/opportunities/search-params";

export type FilterOption = { value: string; label: string };

export type FilterLabels = {
  legend: string;
  search: string;
  searchPlaceholder: string;
  region: string;
  regionAny: string;
  format: string;
  formatAny: string;
  sort: string;
  openOnly: string;
  apply: string;
  clear: string;
};

export function OpportunityFilters({
  action,
  labels,
  regions,
  formats,
  sorts,
  hiddenValue,
  clearHref,
  activeCount,
}: {
  action: string;
  labels: FilterLabels;
  regions: readonly FilterOption[];
  formats: readonly FilterOption[];
  sorts: readonly FilterOption[];
  hiddenValue?: { name: string; value: string };
  clearHref: string;
  activeCount: number;
}) {
  const [filters, setFilters] = useQueryStates(opportunityFilterParsers, {
    shallow: false,
    history: "push",
    scroll: false,
  });

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
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
    >
      {hiddenValue ? (
        <input type="hidden" name={hiddenValue.name} value={hiddenValue.value} />
      ) : null}
      <div className="relative sm:col-span-2 xl:col-span-1">
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

      <div>
        <label htmlFor="filter-region" className="sr-only">
          {labels.region}
        </label>
        <NativeSelect
          id="filter-region"
          name="region"
          value={filters.region ?? ""}
          onChange={(event) =>
            void setFilters({
              region: parseOpportunityFilters({ region: event.target.value }).region,
            })
          }
          className="min-h-11 text-sm"
        >
          <NativeSelectOption value="">{labels.regionAny}</NativeSelectOption>
          {regions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div>
        <label htmlFor="filter-format" className="sr-only">
          {labels.format}
        </label>
        <NativeSelect
          id="filter-format"
          name="format"
          value={filters.format ?? ""}
          onChange={(event) =>
            void setFilters({
              format: parseOpportunityFilters({ format: event.target.value }).format,
            })
          }
          className="min-h-11 text-sm"
        >
          <NativeSelectOption value="">{labels.formatAny}</NativeSelectOption>
          {formats.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div>
        <label htmlFor="filter-sort" className="sr-only">
          {labels.sort}
        </label>
        <NativeSelect
          id="filter-sort"
          name="sort"
          value={filters.sort}
          onChange={(event) =>
            void setFilters({
              sort: parseOpportunityFilters({ sort: event.target.value }).sort,
            })
          }
          className="min-h-11 text-sm"
        >
          {sorts.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2 xl:col-span-4">
        <Switch
          name="open"
          label={labels.openOnly}
          checked={filters.open}
          onCheckedChange={(next) => void setFilters({ open: next })}
          className="gap-3"
        />
        <div className="flex gap-2">
          {activeCount > 0 ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={clearHref}>{labels.clear}</Link>
            </Button>
          ) : null}
          <Button type="submit" size="sm">
            {labels.apply}
          </Button>
        </div>
      </div>
    </form>
  );
}
