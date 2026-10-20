import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/locale";

/** Brand identity, in-page navigation and the primary booking call to action. */
export function SiteHeader({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const links = [
    { href: "/#features", label: dict.site.navFeatures },
    { href: "/#process", label: dict.site.navProcess },
    { href: "/#private", label: dict.site.navPrivate },
    { href: "/#faq", label: dict.site.navFaq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-16">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-2.5"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-foreground/10 sm:size-9"
          >
            <Image src="/logo.jpeg" alt="" width={36} height={36} className="size-full object-cover" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-tighter">
              {dict.site.brandName}
            </span>
            {/* The tagline is the first thing to go on a narrow phone; the
                brand mark and name alone are enough to keep the row on one line. */}
            <span className="hidden text-xs text-muted-foreground sm:block">
              {dict.site.brandTagline}
            </span>
          </span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Main" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSwitcher locale={locale} label={dict.common.languageSwitcherLabel} />
          <Button
            render={<Link href="/admin/bookings" aria-label={dict.site.navAdmin} />}
            // This renders as an <a>, not a <button> — tell Base UI that's
            // intentional so it doesn't warn about missing button semantics.
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="px-1.5 sm:px-2.5"
          >
            <LockKeyhole aria-hidden="true" className="size-4 sm:hidden" />
            <span className="hidden sm:inline">{dict.site.navAdmin}</span>
          </Button>
          <Button
            render={<Link href="/#booking" />}
            nativeButton={false}
            size="sm"
            className="h-9 rounded-full px-4 font-bold hover:bg-primary/90 active:scale-95"
          >
            <span className="sm:hidden">{dict.site.navBookClassShort}</span>
            <span className="hidden sm:inline">{dict.site.navBookClass}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
