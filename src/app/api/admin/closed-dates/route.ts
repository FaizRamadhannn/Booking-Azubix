import { NextResponse } from "next/server";

import { isAdminAuthorized } from "@/lib/auth/admin";
import { BookingError } from "@/lib/booking/errors";
import { closeDay, listClosedDays, reopenDay } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

const UNAUTHORIZED = () =>
  NextResponse.json(
    { code: "UNAUTHORIZED", message: "Admin access required.", fieldErrors: {} },
    { status: 401 },
  );

function respond(closedDays: unknown) {
  return NextResponse.json({ closedDays }, { headers: { "Cache-Control": "no-store" } });
}

function errorResponse(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json(error.toJSON(), { status: error.httpStatus });
  }
  console.error("[admin/closed-dates] unexpected error", error);
  return NextResponse.json(
    { code: "INTERNAL", message: "Something went wrong. Please try again.", fieldErrors: {} },
    { status: 500 },
  );
}

/** Closed days from today onwards. Admin only. */
export async function GET() {
  if (!(await isAdminAuthorized())) return UNAUTHORIZED();
  try {
    return respond(await listClosedDays());
  } catch (error) {
    return errorResponse(error);
  }
}

/** Close a weekday: `{ "date": "2026-11-02", "reason": "Libur nasional" }`. */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) return UNAUTHORIZED();

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
    return respond(await closeDay(body));
  } catch (error) {
    return errorResponse(error);
  }
}

/** Open a closed day again: `DELETE /api/admin/closed-dates?date=2026-11-02`. */
export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) return UNAUTHORIZED();

  const date = new URL(request.url).searchParams.get("date") ?? "";
  try {
    return respond(await reopenDay(date));
  } catch (error) {
    return errorResponse(error);
  }
}
