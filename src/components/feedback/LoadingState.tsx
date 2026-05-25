import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Carregando...",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-ink-muted animate-fade-in",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative h-8 w-8"
      >
        <span className="absolute inset-0 rounded-full border-2 border-line" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand" />
      </span>
      <p className="text-[13px] tracking-[-0.005em]">{message}</p>
    </div>
  );
}
