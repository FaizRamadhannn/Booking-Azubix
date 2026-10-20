import Link from "next/link";

import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  const links = [
    { href: "/#process", label: dict.site.navProcess },
    { href: "/#private", label: dict.site.navPrivate },
    { href: "/#faq", label: dict.site.navFaq },
    { href: "/#booking", label: dict.site.navBookClass },
  ];

  return (
    <footer className="mt-auto w-full border-t border-foreground/5 bg-background py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-16">
        <p className="text-xl font-bold tracking-tighter">{dict.site.brandName}</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs text-muted-foreground">
          <p>{dict.site.footerTagline}</p>
          <p>{format(dict.site.footerTimezoneNote, { timezone: TIMEZONE_LABEL })}</p>
        </div>
      </div>
    </footer>
  );
}
