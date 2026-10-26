import { NextResponse } from "next/server";

import { BookingError } from "@/lib/booking/errors";
import { lookupPackage } from "@/lib/booking/service";
import { rateLimitedResponse, withinRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public: a private student checks their package before booking the next
 * session. Needs the package code *and* the WhatsApp number it was bought
 * with; returns only what the booking form needs.
 */
export async function POST(request: Request) {
  if (!(await withinRateLimit(request, "packageLookup"))) return rateLimitedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "Invalid request body.", fieldErrors: {} },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await lookupPackage(body), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(error.toJSON(), { status: error.httpStatus });
    }
    console.error("[packages/lookup] unexpected error", error);
    return NextResponse.json(
      { code: "INTERNAL", message: "Something went wrong. Please try again.", fieldErrors: {} },
      { status: 500 },
    );
  }
}
