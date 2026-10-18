import { NextResponse } from "next/server";
import { z } from "zod";

import { BookingError } from "@/lib/booking/errors";
import { markBookingPaid } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

/**
 * Public: the student says "I have paid" and under which name. Requires the
 * booking id *and* its payment code, both of which only the student who
 * created the booking has. The body is validated in the service.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "That booking no longer exists.", fieldErrors: {} },
      { status: 404 },
    );
  }

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
    return NextResponse.json(await markBookingPaid(id, body));
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(error.toJSON(), { status: error.httpStatus });
    }
    console.error("[bookings/:id/paid] unexpected error", error);
    return NextResponse.json(
      { code: "INTERNAL", message: "Something went wrong. Please try again.", fieldErrors: {} },
      { status: 500 },
    );
  }
}
