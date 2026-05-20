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
        "flex flex-col items-center justify-center gap-3 py-10 text-slate-500",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
      />
      <p className="text-sm">{message}</p>
    </div>
  );
}
