import { MessageCircle } from "lucide-react";

import { formatDateTime } from "@/lib/booking/datetime";
import type { PrivatePackage } from "@/lib/booking/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { intlTag, type Locale } from "@/lib/i18n/locale";
import { cn, formatRupiah, formatWhatsappNumber, whatsappUrl } from "@/lib/utils";

const STATUS_STYLES: Record<PrivatePackage["status"], string> = {
  CONFIRMED: "border-success/40 bg-success-muted text-success",
  PENDING: "border-warning/40 bg-warning-muted text-warning",
  UNPAID: "border-border bg-muted text-muted-foreground",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
};

/** Every private package with its usage, so the admin can follow up by WhatsApp. */
export function PrivatePackagesTable({
  packages,
  dict,
  locale,
}: {
  packages: PrivatePackage[];
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.admin.packages;
  const tag = intlTag(locale);

  return (
    <section aria-labelledby="packages-heading" className="glass-card rounded-2xl p-4 sm:p-6">
      <h2 id="packages-heading" className="text-lg font-semibold tracking-tight">
        {t.heading}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.subtext}</p>

      {packages.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">{t.code}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.student}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.whatsapp}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.level}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.sessions}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.status}</th>
                <th scope="col" className="py-2 pr-3 font-medium">{t.amount}</th>
                <th scope="col" className="py-2 font-medium">{t.created}</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-mono">{pkg.packageCode}</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">{pkg.studentName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {pkg.whatsappGroupName}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <a
                      href={whatsappUrl(pkg.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary tabular-nums underline-offset-4 hover:underline"
                    >
                      <MessageCircle aria-hidden="true" className="size-3.5" />
                      {formatWhatsappNumber(pkg.whatsappNumber)}
                    </a>
                  </td>
                  <td className="py-2.5 pr-3 font-mono">{pkg.level}</td>
                  <td className="py-2.5 pr-3 tabular-nums">
                    {pkg.sessionsUsed} / {pkg.sessionsTotal}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[pkg.status],
                      )}
                    >
                      {dict.common.packageStatus[pkg.status]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{formatRupiah(pkg.amountPaid)}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">
                    {formatDateTime(pkg.createdAt, tag)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
