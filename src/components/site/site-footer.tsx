import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{dict.site.footerTagline}</p>
        <p>{format(dict.site.footerTimezoneNote, { timezone: TIMEZONE_LABEL })}</p>
      </div>
    </footer>
  );
}
