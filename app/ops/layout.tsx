import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Operations — Media Print Pack",
  robots: { index: false, follow: false },
};

// Internal staff tool: English-only, no next-intl provider. There is no root
// app/layout.tsx (the marketing site lives entirely under app/[locale]/), so
// this route needs its own <html>/<body> shell.
export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper-2 text-ink antialiased">{children}</body>
    </html>
  );
}
