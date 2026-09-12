import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SARV — Cabinetry & Architectural Woodwork",
  description: "Architectural cabinetry, custom interior joinery and precise execution by SARV.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
