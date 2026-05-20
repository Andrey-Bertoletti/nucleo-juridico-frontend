"use client";

import { createContext, useContext } from "react";

import type { Client } from "@/types/client";

export interface ClientDetailContextValue {
  client: Client;
  reload: () => Promise<void>;
  currentUserId: string | undefined;
}

export const ClientDetailContext = createContext<
  ClientDetailContextValue | undefined
>(undefined);

export function useClientDetail(): ClientDetailContextValue {
  const ctx = useContext(ClientDetailContext);
  if (!ctx) {
    throw new Error(
      "useClientDetail deve ser usado dentro do layout de /clientes/[id].",
    );
  }
  return ctx;
}
