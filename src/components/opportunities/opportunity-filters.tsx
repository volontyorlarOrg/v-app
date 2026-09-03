"use client";

import { Search } from "lucide-react";
import { useRef } from "react";

import { buttonClass } from "@/components/ui/button";
import { controlClass, Select } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import type { OpportunityFilters as Filters } from "@/lib/opportunities/filters";
import { cn } from "@/lib/utils";

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
  values,
  hiddenValue,
  clearHref,
  activeCount,
}: {
  action: string;
  labels: FilterLabels;
  regions: readonly FilterOption[];
  formats: readonly FilterOption[];
  sorts: readonly FilterOption[];
  values: Filters;
  hiddenValue?: { name: string; value: string };
  clearHref: string;
  activeCount: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function submitSoon() {
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <form
      ref={formRef}
      method="get"
      action={action}
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
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={values.q}
          placeholder={labels.searchPlaceholder}
          className={cn(controlClass, "min-h-11 pl-11 text-sm")}
        />
      </div>

      <div>
        <label htmlFor="filter-region" className="sr-only">
          {labels.region}
        </label>
        <Select
          id="filter-region"
          name="region"
          defaultValue={values.region ?? ""}
          onChange={submitSoon}
          className="min-h-11 text-sm"
        >
          <option value="">{labels.regionAny}</option>
          {regions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="filter-format" className="sr-only">
          {labels.format}
        </label>
        <Select
          id="filter-format"
          name="format"
          defaultValue={values.format ?? ""}
          onChange={submitSoon}
          className="min-h-11 text-sm"
        >
          <option value="">{labels.formatAny}</option>
          {formats.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="filter-sort" className="sr-only">
          {labels.sort}
        </label>
        <Select
          id="filter-sort"
          name="sort"
          defaultValue={values.sort}
          onChange={submitSoon}
          className="min-h-11 text-sm"
        >
          {sorts.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2 xl:col-span-4">
        <Switch
          name="open"
          label={labels.openOnly}
          defaultChecked={values.openOnly}
          onCheckedChange={submitSoon}
          className="gap-3"
        />
        <div className="flex gap-2">
          {activeCount > 0 ? (
            <Link
              href={clearHref}
              className={buttonClass({ variant: "ghost", size: "sm" })}
            >
              {labels.clear}
            </Link>
          ) : null}
          <button type="submit" className={buttonClass({ size: "sm" })}>
            {labels.apply}
          </button>
        </div>
      </div>
    </form>
  );
}
