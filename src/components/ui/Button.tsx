"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "brand";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-ink-inverted hover:bg-ink/90 active:bg-ink/80 shadow-apple-sm",
  brand:
    "bg-brand text-white hover:bg-brand-hover active:bg-brand-hover shadow-apple-sm",
  secondary:
    "bg-surface-sunken text-ink hover:bg-surface-sunken/80 border border-line",
  ghost: "bg-transparent text-ink hover:bg-surface-sunken",
  danger:
    "bg-accent-rose text-white hover:bg-accent-rose/90 shadow-apple-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.005em]",
          "transition-all duration-200 ease-apple-snap will-change-transform",
          "hover:-translate-y-[0.5px] active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {isLoading ? (
          <>
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
            />
            <span>Carregando...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
