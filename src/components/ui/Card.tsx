import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  /** Use the frosted-glass look (sidebar / floating panels). */
  glass?: boolean;
}

export function Card({
  title,
  description,
  footer,
  className,
  children,
  glass = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line shadow-apple-sm",
        "transition-all duration-300 ease-apple",
        glass ? "glass" : "bg-surface-card",
        className,
      )}
      {...rest}
    >
      {(title || description) && (
        <div className="border-b border-line-subtle px-5 py-4">
          {title && (
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-line-subtle bg-surface-sunken/60 px-5 py-3 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
