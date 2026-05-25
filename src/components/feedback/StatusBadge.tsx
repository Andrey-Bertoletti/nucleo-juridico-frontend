import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_TONES,
  type AppointmentStatus,
} from "@/types/appointment";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TONES,
  type AttendanceStatus,
  type BadgeTone,
} from "@/types/attendance";

const TONE_CLASSES: Record<BadgeTone, string> = {
  slate:
    "bg-surface-sunken text-ink-muted border-line",
  blue:
    "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
  amber:
    "bg-accent-amber/12 text-accent-amber border-accent-amber/25",
  emerald:
    "bg-accent-emerald/12 text-accent-emerald border-accent-emerald/25",
  rose:
    "bg-accent-rose/12 text-accent-rose border-accent-rose/25",
  violet:
    "bg-accent-violet/12 text-accent-violet border-accent-violet/25",
  indigo:
    "bg-accent-indigo/12 text-accent-indigo border-accent-indigo/25",
  neutral:
    "bg-surface-sunken text-ink-muted border-line",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[-0.005em]",
        "transition-colors duration-200 ease-apple-snap",
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
  return (
    <StatusBadge tone="rose">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-rose opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-rose" />
      </span>
      Urgente
    </StatusBadge>
  );
}

export function AppointmentStatusBadge({
  value,
}: {
  value: AppointmentStatus;
}) {
  return (
    <StatusBadge tone={APPOINTMENT_STATUS_TONES[value]}>
      {APPOINTMENT_STATUS_LABELS[value]}
    </StatusBadge>
  );
}
