import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/** Splits on `**bold**` markers and wraps the marked segments in <strong>. */
function renderWithBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export function BookingTerms({ dict }: { dict: Dictionary }) {
  const t = dict.booking.terms;
  const items = [t.item1, t.item2, t.item3];

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm sm:p-5">
      <p className="font-semibold tracking-tight">{t.heading}</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{renderWithBold(item)}</li>
        ))}
      </ul>
      <p className="mt-3 text-muted-foreground">{t.footer}</p>
    </div>
  );
}
