"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useController, type Control } from "react-hook-form";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import type { ProfileFormValues } from "@/lib/profile/input";
import {
  PROFILE_LANGUAGE_LIMIT,
  filterLanguageOptions,
  type LanguageOption,
} from "@/lib/profile/languages";
import { motionAllowed } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type LanguagePickerLabels = {
  search: string;
  empty: string;
  common: string;
  all: string;
  remove: string;
  limit: string;
};

type Group = { key: string; label: string | null; items: LanguageOption[] };

export function LanguagePicker({
  id,
  control,
  options,
  labels,
  describedBy,
  invalid = false,
}: {
  id: string;
  control: Control<ProfileFormValues>;
  options: readonly LanguageOption[];
  labels: LanguagePickerLabels;
  describedBy?: string;
  invalid?: boolean;
}) {
  const { field } = useController({ control, name: "languages" });
  const selected = field.value ?? [];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const positions = useMemo(
    () => new Map(options.map((option, index) => [option.value, index])),
    [options],
  );
  const labelOf = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );
  const matches = useMemo(
    () => filterLanguageOptions(options, query),
    [options, query],
  );

  const groups: Group[] =
    query.trim() === ""
      ? [
          {
            key: "common",
            label: labels.common,
            items: matches.filter((option) => option.common),
          },
          { key: "all", label: labels.all, items: matches.filter((o) => !o.common) },
        ]
      : [{ key: "matches", label: null, items: matches }];
  const ordered = groups.flatMap((group) => group.items);

  const chosen = new Set(selected);
  const full = chosen.size >= PROFILE_LANGUAGE_LIMIT;
  const unavailable = (value: string) => full && !chosen.has(value);
  const optionId = (value: string) => `${id}-option-${positions.get(value) ?? 0}`;
  const activeId = open && active !== null ? optionId(active) : undefined;

  useEffect(() => {
    if (activeId)
      document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  const firstAvailable = (list: readonly LanguageOption[]) =>
    list.find((option) => !unavailable(option.value))?.value ?? null;

  const toggle = (value: string) => {
    if (chosen.has(value)) {
      field.onChange(selected.filter((item) => item !== value));
    } else if (!full) {
      field.onChange([...selected, value]);
      if (query) setQuery("");
    }
    setActive(value);
  };

  const remove = (value: string) => {
    field.onChange(selected.filter((item) => item !== value));
    inputRef.current?.focus();
  };

  const move = (step: 1 | -1) => {
    const available = ordered.filter((option) => !unavailable(option.value));
    if (available.length === 0) return;
    const current = available.findIndex((option) => option.value === active);
    const next =
      current === -1
        ? step === 1
          ? 0
          : available.length - 1
        : (current + step + available.length) % available.length;
    setActive(available[next]?.value ?? null);
  };

  const search = (value: string) => {
    setQuery(value);
    setOpen(true);
    setActive(
      value.trim() ? firstAvailable(filterLanguageOptions(options, value)) : null,
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActive((current) => current ?? firstAvailable(ordered));
          return;
        }
        move(event.key === "ArrowDown" ? 1 : -1);
        return;
      case "Enter":
        if (!open) return;
        event.preventDefault();
        if (active !== null && !unavailable(active)) toggle(active);
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        } else if (query) {
          event.preventDefault();
          setQuery("");
        }
        return;
      case "Backspace":
        if (query === "" && selected.length > 0) field.onChange(selected.slice(0, -1));
        return;
      case "Tab":
        setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={controlRef}
          data-invalid={invalid || undefined}
          onMouseDown={(event) => {
            const target = event.target as Element;
            if (target === inputRef.current || target.closest("button")) return;
            event.preventDefault();
            inputRef.current?.focus();
            setOpen(true);
          }}
          className="relative flex min-h-12 w-full min-w-0 cursor-text scroll-mt-24 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-field py-1.5 pr-10 pl-1.5 transition-colors hover:border-primary-ink has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-primary-ink data-invalid:border-ink"
        >
          {selected.map((value) => {
            const label = labelOf.get(value) ?? value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => remove(value)}
                aria-label={`${labels.remove}: ${label}`}
                className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-full bg-surface-soft py-1 pr-2 pl-3 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-muted"
              >
                <span className="truncate">{label}</span>
                <X aria-hidden="true" className="size-3.5 shrink-0" />
              </button>
            );
          })}
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            value={query}
            placeholder={selected.length === 0 ? labels.search : undefined}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => search(event.target.value)}
            onClick={() => setOpen(true)}
            onFocus={() => {
              if (matchMedia("(width < 64rem)").matches) {
                controlRef.current?.scrollIntoView?.({
                  block: "start",
                  behavior: motionAllowed() ? "smooth" : "auto",
                });
              }
            }}
            onKeyDown={onKeyDown}
            className="min-h-9 min-w-16 flex-1 bg-transparent px-2.5 text-base text-foreground caret-primary-ink outline-none placeholder:text-muted-foreground"
          />
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-4 right-3.5 size-4 text-ink-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          />
          {selected.map((value) => (
            <input key={value} type="hidden" name="languages" value={value} />
          ))}
        </div>
      </PopoverAnchor>
      <PopoverContent
        role="presentation"
        align="start"
        sideOffset={6}
        collisionPadding={{ top: 72, right: 16, bottom: 72, left: 16 }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (controlRef.current?.contains(event.target as Node))
            event.preventDefault();
        }}
        className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
      >
        {full ? (
          <p className="border-b border-border px-4 py-2.5 text-xs leading-relaxed text-ink-muted">
            {labels.limit}
          </p>
        ) : null}
        <ul
          id={`${id}-options`}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${id}-label`}
          className="max-h-[min(18rem,calc(var(--radix-popover-content-available-height)-1rem))] overflow-y-auto overscroll-contain p-1.5"
        >
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <li
                key={group.key}
                role="presentation"
                className="border-border not-first:mt-1.5 not-first:border-t not-first:pt-1.5"
              >
                {group.label ? (
                  <div
                    id={`${id}-group-${group.key}`}
                    className="px-2.5 pt-1.5 pb-1 text-xs font-semibold text-ink-muted"
                  >
                    {group.label}
                  </div>
                ) : null}
                <ul
                  role="group"
                  aria-labelledby={group.label ? `${id}-group-${group.key}` : undefined}
                >
                  {group.items.map((option) => (
                    <LanguageOptionRow
                      key={option.value}
                      id={optionId(option.value)}
                      option={option}
                      selected={chosen.has(option.value)}
                      active={option.value === active}
                      disabled={unavailable(option.value)}
                      onPick={toggle}
                      onPoint={setActive}
                    />
                  ))}
                </ul>
              </li>
            ),
          )}
        </ul>
        {matches.length === 0 ? (
          <p
            role="status"
            className="px-4 pt-1 pb-5 text-center text-sm text-ink-muted"
          >
            {labels.empty}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function LanguageOptionRow({
  id,
  option,
  selected,
  active,
  disabled,
  onPick,
  onPoint,
}: {
  id: string;
  option: LanguageOption;
  selected: boolean;
  active: boolean;
  disabled: boolean;
  onPick: (value: string) => void;
  onPoint: (value: string) => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={() => {
        if (!active && !disabled) onPoint(option.value);
      }}
      onClick={() => {
        if (!disabled) onPick(option.value);
      }}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm text-ink select-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-active:bg-surface-soft"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[1.125rem] shrink-0 place-items-center rounded-sm border transition-colors duration-150",
          selected
            ? "border-action bg-action text-knockout"
            : "border-border-control bg-field",
        )}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
    </li>
  );
}
