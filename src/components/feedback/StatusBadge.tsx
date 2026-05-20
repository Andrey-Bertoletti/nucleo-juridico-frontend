import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TONES,
  type AttendanceStatus,
  type BadgeTone,
} from "@/types/attendance";

const TONE_CLASSES: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
  indigo: "bg-indigo-50 text-indigo-700",
  neutral: "bg-slate-100 text-slate-600",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AttendanceStatusBadge({
  value,
}: {
  value: AttendanceStatus;
}) {
  return (
    <StatusBadge tone={ATTENDANCE_STATUS_TONES[value]}>
      {ATTENDANCE_STATUS_LABELS[value]}
    </StatusBadge>
  );
}

export function UrgencyBadge({ urgency }: { urgency: boolean }) {
  if (!urgency) {
    return <StatusBadge tone="slate">Normal</StatusBadge>;
  }
  return <StatusBadge tone="rose">Urgente</StatusBadge>;
}
