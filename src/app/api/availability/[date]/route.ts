import { NextResponse } from "next/server";

import { isValidIsoDate } from "@/lib/booking/datetime";
import { getDayAvailability } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ date: string }> },
) {
  const { date } = await context.params;

  if (!isValidIsoDate(date)) {
    return NextResponse.json(
      {
        code: "VALIDATION_FAILED",
        message: "Invalid date.",
        fieldErrors: { date: "Invalid date." },
      },
      { status: 400 },
    );
  }

  return NextResponse.json(await getDayAvailability(date), {
    headers: { "Cache-Control": "no-store" },
  });
}
