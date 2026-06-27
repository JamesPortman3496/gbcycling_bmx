import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell, AthleteDraftProvider } from "@/src/components";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMX Freestyle Park Performance Tracker",
  description: "Track BMX Freestyle Park competition and athlete performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AthleteDraftProvider>
          <AppShell>{children}</AppShell>
        </AthleteDraftProvider>
      </body>
    </html>
  );
}
