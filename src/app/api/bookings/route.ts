import { NextResponse } from "next/server";

import { isAdminAuthorized } from "@/lib/auth/admin";
import { BookingError } from "@/lib/booking/errors";
import { createBooking, listBookings } from "@/lib/booking/service";
import { bookingFiltersSchema, toFieldErrors } from "@/lib/booking/validation";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json(error.toJSON(), { status: error.httpStatus });
  }
  console.error("[bookings] unexpected error", error);
  return NextResponse.json(
    {
      code: "INTERNAL",
      message: "Something went wrong. Please try again.",
      fieldErrors: {},
    },
    { status: 500 },
  );
}

/** Public booking endpoint. Every field is re-validated here; the client is never trusted. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        code: "VALIDATION_FAILED",
        message: "Invalid request body.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  try {
    const booking = await createBooking(payload);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Admin listing. Booking data is never exposed to unauthenticated callers. */
export async function GET(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        message: "Admin access required.",
        fieldErrors: {},
      },
      { status: 401 },
    );
  }

  const params = new URL(request.url).searchParams;
  const raw = {
    date: params.get("date") || undefined,
    level: params.get("level") || undefined,
    status: params.get("status") || undefined,
  };

  const parsed = bookingFiltersSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_FAILED",
        message: "Invalid filters.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      { bookings: await listBookings(parsed.data) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
