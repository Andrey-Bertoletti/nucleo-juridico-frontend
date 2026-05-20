import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/AuthContext";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "NPJ - ITES — Sistema de Gestão de Atendimento Jurídico",
  description:
    "Plataforma do Núcleo de Práticas Jurídicas do Instituto Taquaritinguense de Ensino Superior.",
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
