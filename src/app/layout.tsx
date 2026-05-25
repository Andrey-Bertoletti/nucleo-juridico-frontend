import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthContext";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "NPJ - ITES — Sistema de Gestão de Atendimento Jurídico",
  description:
    "Plataforma do Núcleo de Práticas Jurídicas do Instituto Taquaritinguense de Ensino Superior.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          // Applies the saved theme before React hydrates, avoiding the
          // light-then-dark flash on first paint.
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="bg-surface-base text-ink antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
