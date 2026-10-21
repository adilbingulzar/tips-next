import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { LocaleRoot } from "@/components/i18n/LocaleRoot";
import { ThemeScript } from "@/components/theme/ThemeScript";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS",
    template: `%s · ${process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS"}`,
  },
  description: "Tip and review the people who served you.",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeScript />
        {/* The language comes from the request, so the page streams in after it is known. */}
        <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
          <LocaleRoot>{children}</LocaleRoot>
        </Suspense>
      </body>
    </html>
  );
}
