"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

export interface ComboboxProps<T> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;

  value: string | null | undefined;
  options: T[];
  getKey: (option: T) => string;
  getLabel: (option: T) => string;
  getDescription?: (option: T) => string | null | undefined;

  onChange: (key: string | null) => void;
}

export function Combobox<T>({
  label,
  error,
  hint,
  placeholder = "Selecione...",
  disabled = false,
  emptyMessage = "Nenhum resultado.",
  value,
  options,
  getKey,
  getLabel,
  getDescription,
  onChange,
}: ComboboxProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () =>
      value
        ? options.find((o) => getKey(o) === value) ?? null
        : null,
    [value, options, getKey],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const lbl = getLabel(o).toLowerCase();
      const desc = (getDescription?.(o) ?? "").toLowerCase();
      return lbl.includes(q) || desc.includes(q);
    });
  }, [search, options, getLabel, getDescription]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  function commit(option: T) {
    onChange(getKey(option));
    setOpen(false);
    setSearch("");
  }

  function clear() {
    onChange(null);
    setSearch("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = filtered[activeIndex];
      if (o) commit(o);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={`${id}-button`}
          className="text-[13px] font-medium tracking-[-0.005em] text-ink"
        >
          {label}
        </label>
      )}

      <div className="flex items-stretch gap-1.5">
        <button
          id={`${id}-button`}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-surface-sunken px-3.5 text-left text-[14px] text-ink",
            "transition-all duration-200 ease-apple-snap",
            "focus:outline-none focus:border-brand focus:bg-surface-card focus:shadow-ring-brand",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-accent-rose" : "border-line",
            !selected && "text-ink-subtle",
          )}
        >
          <span className="truncate">
            {selected ? getLabel(selected) : placeholder}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              "h-4 w-4 text-ink-subtle transition-transform duration-200 ease-apple-snap",
              open && "rotate-180",
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {selected && !disabled && (
          <button
            type="button"
            onClick={clear}
            title="Limpar seleção"
            aria-label="Limpar seleção"
            className="rounded-xl border border-line bg-surface-card px-2.5 text-sm text-ink-muted transition hover:bg-surface-sunken"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-button`}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-hidden rounded-xl border border-line bg-surface-card shadow-apple-md animate-scale-in"
        >
          <div className="border-b border-line-subtle p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKey}
              placeholder="Buscar..."
              className="h-9 w-full rounded-lg border border-line bg-surface-sunken px-3 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus:border-brand focus:shadow-ring-brand transition"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-ink-muted">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((o, idx) => {
                const key = getKey(o);
                const isSelected = key === value;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={key}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(o);
                    }}
                    className={cn(
                      "mx-1 cursor-pointer rounded-lg px-3 py-2 text-[13px] transition-colors",
                      isActive && "bg-surface-sunken",
                      isSelected && "font-medium text-ink",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{getLabel(o)}</span>
                      {isSelected && (
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4 text-brand"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.13a1 1 0 0 1-1.42 0L3.29 8.92a1 1 0 1 1 1.42-1.41l3.21 3.23 6.36-6.42a1 1 0 0 1 1.414-.03Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {getDescription?.(o) && (
                      <div className="truncate text-xs text-ink-subtle">
                        {getDescription(o)}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error ? (
        <span className="animate-fade-in text-[12px] text-accent-rose">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[12px] text-ink-subtle">{hint}</span>
      ) : null}
    </div>
  );
}
