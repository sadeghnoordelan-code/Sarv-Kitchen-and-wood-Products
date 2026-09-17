import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SARV — Cabinetry & Architectural Woodwork",
  description:
    "SARV presents premium cabinetry and architectural woodwork shaped by material, detail, and space.",
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
      <body>{children}</body>
    </html>
  );
}
