import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/AuthContext";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Núcleo Jurídico — Gestão de Atendimento",
  description:
    "Sistema de gestão de atendimento jurídico para núcleos e escritórios.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
