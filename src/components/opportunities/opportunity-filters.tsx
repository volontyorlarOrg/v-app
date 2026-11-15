"use client";

import { ListFilter, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useId, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch, SwitchControl } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import { DEFAULT_FILTERS, parseOpportunityFilters } from "@/lib/opportunities/filters";
import {
  opportunityFilterParsers,
  opportunityViewParser,
} from "@/lib/opportunities/search-params";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export type KindLink = { key: string; label: string; href: string; active: boolean };

export type FilterChip = {
  key: string;
  label: string;
  removeLabel: string;
  href: string;
};

export type FilterLabels = {
  legend: string;
  search: string;
  searchPlaceholder: string;
  kinds: string;
  region: string;
  regionAny: string;
  savedOnly: string;
  clear: string;
  more: string;
  format: string;
  formatAny: string;
  openOnly: string;
  sort: string;
  done: string;
};

const toolbarParsers = { ...opportunityFilterParsers, view: opportunityViewParser };

const controlClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface text-sm font-semibold text-ink transition-colors";

export function OpportunityFilters({
  action,
  labels,
  kinds,
  regions,
  formats,
  sorts,
  hiddenValues = [],
  chips,
  clearHref,
  showClear,
  panelCount,
}: {
  action: string;
  labels: FilterLabels;
  kinds: readonly KindLink[];
  regions: readonly FilterOption[];
  formats: readonly FilterOption[];
  sorts: readonly FilterOption[];
  hiddenValues?: readonly { name: string; value: string }[];
  chips: readonly FilterChip[];
  clearHref: string;
  showClear: boolean;
  panelCount: number;
}) {
  const savedId = useId();
  const [panelOpen, setPanelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useQueryStates(toolbarParsers, {
    shallow: false,
    history: "push",
    scroll: false,
    startTransition,
  });
  const savedOnly = filters.view === "saved";
  const panelChanged = panelCount > 0 || filters.sort !== DEFAULT_FILTERS.sort;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    void setFilters({
      q: parseOpportunityFilters({ q: typeof value === "string" ? value : "" }).q,
    });
  }

  return (
    <form
      method="get"
      action={action}
      onSubmit={onSubmit}
      aria-label={labels.legend}
      aria-busy={pending}
      className="grid gap-3"
    >
      {hiddenValues.map((hidden) => (
        <input
          key={hidden.name}
          type="hidden"
          name={hidden.name}
          value={hidden.value}
        />
      ))}

      <div className="flex gap-2.5">
        <div className="relative min-w-0 flex-1">
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

        <Popover open={panelOpen} onOpenChange={setPanelOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              controlClass,
              "shrink-0 px-3.5 hover:border-primary-ink data-[state=open]:border-primary-ink sm:px-4",
              panelCount > 0 && "border-primary-ink text-primary-ink",
            )}
          >
            {pending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <ListFilter aria-hidden="true" className="size-4" />
            )}
            <span className="max-sm:sr-only">{labels.more}</span>
            {panelCount > 0 ? (
              <span className="tabular inline-flex size-5 items-center justify-center rounded-full bg-action text-xs text-knockout">
                {panelCount}
              </span>
            ) : null}
          </PopoverTrigger>

          <PopoverContent
            align="end"
            collisionPadding={16}
            className="w-[min(22rem,calc(100vw-2rem))] p-0"
          >
            <div className="grid gap-5 p-4">
              <div className="grid gap-2">
                <label
                  htmlFor="filter-region"
                  className="text-xs font-semibold text-ink-muted"
                >
                  {labels.region}
                </label>
                <div className="relative">
                  <MapPin
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-primary"
                  />
                  <NativeSelect
                    id="filter-region"
                    value={filters.region ?? ""}
                    onChange={(event) =>
                      void setFilters({
                        region: parseOpportunityFilters({ region: event.target.value })
                          .region,
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
              </div>

              <ChoiceGroup
                legend={labels.format}
                name="filter-format"
                value={filters.format ?? ""}
                options={[{ value: "", label: labels.formatAny }, ...formats]}
                onChange={(value) =>
                  void setFilters({
                    format: parseOpportunityFilters({ format: value }).format,
                  })
                }
              />

              <Switch
                label={labels.openOnly}
                checked={filters.open}
                onCheckedChange={(next) => void setFilters({ open: next })}
              />

              <ChoiceGroup
                legend={labels.sort}
                name="filter-sort"
                value={filters.sort}
                options={sorts}
                onChange={(value) =>
                  void setFilters({
                    sort: parseOpportunityFilters({ sort: value }).sort,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-3"
                disabled={!panelChanged}
                onClick={() =>
                  void setFilters({
                    region: null,
                    format: null,
                    open: null,
                    sort: null,
                  })
                }
              >
                {labels.clear}
              </Button>
              <Button type="button" size="sm" onClick={() => setPanelOpen(false)}>
                {labels.done}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
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

        <div className="flex items-center gap-2">
          <label
            id={`${savedId}-label`}
            htmlFor={savedId}
            className="cursor-pointer text-sm font-semibold whitespace-nowrap text-ink"
          >
            {labels.savedOnly}
          </label>
          <SwitchControl
            id={savedId}
            checked={savedOnly}
            onCheckedChange={(next) => void setFilters({ view: next ? "saved" : null })}
            aria-labelledby={`${savedId}-label`}
          />
        </div>
      </div>

      {chips.length > 0 || showClear ? (
        <ul className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.href}
                scroll={false}
                aria-label={chip.removeLabel}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/40 bg-surface-soft pr-2.5 pl-3.5 text-sm font-semibold text-primary-ink transition-colors hover:border-primary-ink"
              >
                {chip.label}
                <X aria-hidden="true" className="size-3.5" />
              </Link>
            </li>
          ))}
          {showClear ? (
            <li>
              <Link
                href={clearHref}
                scroll={false}
                className="inline-flex min-h-9 items-center px-1.5 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {labels.clear}
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </form>
  );
}

function ChoiceGroup({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-10 items-center rounded-full border border-input bg-surface px-3.5 text-sm font-semibold text-ink transition-colors peer-checked:border-action peer-checked:bg-action peer-checked:text-knockout peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-ink hover:border-primary-ink">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
