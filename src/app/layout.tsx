import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getLocaleAndDictionary } from "@/lib/i18n/server";

// `--font-sans` is what the Tailwind theme in globals.css reads.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getLocaleAndDictionary();
  return locale === "de"
    ? {
        title: "Azubixbook — Deutschkurs buchen",
        description:
          "Buchen Sie einen Deutschkurs A1, A2 oder B1. Nur Wochentagstermine, live angezeigt in der Zeitzone Asia/Jakarta.",
      }
    : {
        title: "Azubixbook — Book a German class",
        description:
          "Book a German A1, A2 or B1 class. Weekday slots only, shown live in Asia/Jakarta time.",
      };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, dict } = await getLocaleAndDictionary();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#booking"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          {dict.common.skipToBooking}
        </a>
        {children}
      </body>
    </html>
  );
}
