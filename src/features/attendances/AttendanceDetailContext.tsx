"use client";

import { createContext, useContext } from "react";

import type { Attendance } from "@/types/attendance";
import type { Client } from "@/types/client";

export interface AttendanceDetailContextValue {
  attendance: Attendance;
  client: Client | null;
  legalAreaName: string | null;
  demandTypeName: string | null;
  studentName: string | null;
  teacherName: string | null;
  reload: () => Promise<void>;
  currentUserId: string | undefined;
}

export const AttendanceDetailContext = createContext<
  AttendanceDetailContextValue | undefined
>(undefined);

export function useAttendanceDetail(): AttendanceDetailContextValue {
  const ctx = useContext(AttendanceDetailContext);
  if (!ctx) {
    throw new Error(
      "useAttendanceDetail deve ser usado dentro do layout de /atendimentos/[id].",
    );
  }
  return ctx;
}
