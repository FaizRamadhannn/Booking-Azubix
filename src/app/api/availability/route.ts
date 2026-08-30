import { NextResponse } from "next/server";

import { TIMEZONE, TIMEZONE_LABEL, TIME_SLOTS } from "@/lib/booking/constants";
import { lastBookableDate, todayInZone } from "@/lib/booking/datetime";
import { getCalendar } from "@/lib/booking/service";

/** Availability depends on "now" and on the database, so it is never cached. */
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  return NextResponse.json(
    {
      timezone: TIMEZONE,
      timezoneLabel: TIMEZONE_LABEL,
      today: todayInZone(now),
      lastBookableDate: lastBookableDate(now),
      timeSlots: TIME_SLOTS,
      calendar: await getCalendar(now),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
