"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchSelectOption = {
  id: string;
  label: string;
  hint?: string;
};

export type SearchSelectLabels = {
  placeholder: string;
  search: string;
  empty: string;
};

const VISIBLE_LIMIT = 200;

export function SearchSelect({
  id,
  name,
  value,
  selectedLabel,
  options,
  onChange,
  labels,
  filter,
  extra,
  footer,
  status,
  disabled = false,
  invalid = false,
  describedBy,
}: {
  id: string;
  name: string;
  value: string;
  selectedLabel: string | null;
  options: readonly SearchSelectOption[];
  onChange: (option: SearchSelectOption) => void;
  labels: SearchSelectLabels;
  filter: (option: SearchSelectOption, query: string) => boolean;
  extra?: (query: string) => SearchSelectOption | null;
  footer?: string;
  status?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const matches = useMemo(() => {
    const found = options.filter((option) => filter(option, query));
    const added = extra?.(query);
    return added && !found.some((option) => option.id === added.id)
      ? [added, ...found]
      : found;
  }, [options, filter, extra, query]);
  const visible = matches.slice(0, VISIBLE_LIMIT);
  const positions = useMemo(
    () => new Map(visible.map((option, index) => [option.id, index])),
    [visible],
  );
  const optionId = (key: string) => `${id}-option-${positions.get(key) ?? 0}`;
  const activeId = open && active !== null ? optionId(active) : undefined;

  useEffect(() => {
    if (activeId)
      document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setActive(value || null);
    setOpen(true);
  };

  const pick = (key: string) => {
    const option = visible.find((candidate) => candidate.id === key);
    if (option) onChange(option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (step: 1 | -1) => {
    if (visible.length === 0) return;
    const current = visible.findIndex((option) => option.id === active);
    const next =
      current === -1
        ? step === 1
          ? 0
          : visible.length - 1
        : (current + step + visible.length) % visible.length;
    setActive(visible[next]?.id ?? null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        move(event.key === "ArrowDown" ? 1 : -1);
        return;
      case "Enter":
        event.preventDefault();
        if (active !== null) pick(active);
        else if (visible[0]) pick(visible[0].id);
        return;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      case "Tab":
        setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-options` : undefined}
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openList();
            }
          }}
          className="relative flex min-h-12 w-full min-w-0 items-center rounded-lg border border-input bg-field py-2 pr-10 pl-3.5 text-left text-base transition-colors hover:border-primary-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:opacity-60 data-invalid:border-ink"
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              selectedLabel ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedLabel ?? labels.placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverAnchor>
      <input type="hidden" name={name} value={value} />
      <PopoverContent
        role="presentation"
        align="start"
        sideOffset={6}
        collisionPadding={{ top: 72, right: 16, bottom: 72, left: 16 }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden p-0"
      >
        <div className="relative border-b border-border">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            ref={searchRef}
            type="text"
            role="combobox"
            aria-label={labels.search}
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            value={query}
            placeholder={labels.search}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(null);
            }}
            onKeyDown={onKeyDown}
            className="min-h-11 w-full bg-transparent py-2 pr-3 pl-10 text-base text-foreground caret-primary-ink outline-none placeholder:text-muted-foreground"
          />
        </div>
        {status ? (
          <p role="status" className="px-4 py-3 text-sm text-ink-muted">
            {status}
          </p>
        ) : null}
        <ul
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="max-h-[min(18rem,calc(var(--radix-popover-content-available-height)-4rem))] overflow-y-auto overscroll-contain p-1.5"
        >
          {visible.map((option) => (
            <li
              key={option.id}
              id={optionId(option.id)}
              role="option"
              aria-selected={option.id === value}
              data-active={option.id === active || undefined}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => {
                if (active !== option.id) setActive(option.id);
              }}
              onClick={() => pick(option.id)}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-ink select-none data-active:bg-surface-soft"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.hint ? (
                  <span className="block truncate text-xs text-ink-muted">
                    {option.hint}
                  </span>
                ) : null}
              </span>
              {option.id === value ? (
                <Check
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary-ink"
                />
              ) : null}
            </li>
          ))}
        </ul>
        {!status && visible.length === 0 ? (
          <p
            role="status"
            className="px-4 pt-1 pb-4 text-center text-sm text-ink-muted"
          >
            {labels.empty}
          </p>
        ) : null}
        {footer ? (
          <p className="border-t border-border px-4 py-2.5 text-xs leading-relaxed text-ink-muted">
            {footer}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
