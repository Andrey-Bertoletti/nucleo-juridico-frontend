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

  /** Valor selecionado (chave). */
  value: string | null | undefined;
  /** Lista completa de opções. */
  options: T[];
  /** Extrai a chave única da opção. */
  getKey: (option: T) => string;
  /** Texto principal exibido. */
  getLabel: (option: T) => string;
  /** Texto secundário, exibido em uma segunda linha (opcional). */
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

  // Click outside fecha
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

  // Reset índice quando filtra
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Foco automático no input quando abre
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
    <div ref={containerRef} className="relative flex flex-col gap-1">
      {label && (
        <label
          htmlFor={`${id}-button`}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="flex items-stretch gap-1">
        <button
          id={`${id}-button`}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm",
            "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            error ? "border-red-400" : "border-slate-300",
            !selected && "text-slate-400",
          )}
        >
          <span className="truncate">
            {selected ? getLabel(selected) : placeholder}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-slate-500"
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
            className="rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-button`}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKey}
              placeholder="Buscar..."
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">
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
                      e.preventDefault(); // evita blur antes do click
                      commit(o);
                    }}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm",
                      isActive && "bg-slate-100",
                      isSelected && "font-medium text-slate-900",
                    )}
                  >
                    <div className="truncate">{getLabel(o)}</div>
                    {getDescription?.(o) && (
                      <div className="truncate text-xs text-slate-500">
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
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </div>
  );
}
