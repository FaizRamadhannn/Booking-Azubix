import { NextResponse } from "next/server";

import { isAdminAuthorized } from "@/lib/auth/admin";
import { BookingError } from "@/lib/booking/errors";
import { applyBookingAction, findBookingById } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json(error.toJSON(), { status: error.httpStatus });
  }
  console.error("[bookings/:id] unexpected error", error);
  return NextResponse.json(
    {
      code: "INTERNAL",
      message: "Something went wrong. Please try again.",
      fieldErrors: {},
    },
    { status: 500 },
  );
}

const UNAUTHORIZED = NextResponse.json(
  { code: "UNAUTHORIZED", message: "Admin access required.", fieldErrors: {} },
  { status: 401 },
);

/** Inspect a single booking. Admin only — this is student data. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthorized())) return UNAUTHORIZED;

  const { id } = await context.params;
  const booking = await findBookingById(id);
  if (!booking) {
    return NextResponse.json(
      {
        code: "NOT_FOUND",
        message: "That booking no longer exists.",
        fieldErrors: {},
      },
      { status: 404 },
    );
  }
  return NextResponse.json(booking, {
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Cancel or reschedule a booking.
 *
 * `{ "action": "cancel" }`
 * `{ "action": "reschedule", "date": "2026-09-01", "timeSlot": "10:00-11:30" }`
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthorized())) return UNAUTHORIZED;

  const { id } = await context.params;

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
    return NextResponse.json(await applyBookingAction(id, payload));
  } catch (error) {
    return errorResponse(error);
  }
}
