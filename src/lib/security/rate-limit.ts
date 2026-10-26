import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { supabaseService } from "@/lib/supabase/service";

interface Window {
  limit: number;
  windowSeconds: number;
}

/**
 * Per-visitor limits for the public endpoints. Generous enough for a real
 * student (a few tries, a typo, a retry), tight enough that a bot cannot hold
 * every slot or guess package codes.
 */
export const RATE_LIMITS = {
  createBooking: [
    { limit: 5, windowSeconds: 10 * 60 },
    { limit: 15, windowSeconds: 24 * 60 * 60 },
  ],
  markPaid: [{ limit: 10, windowSeconds: 10 * 60 }],
  packageLookup: [{ limit: 10, windowSeconds: 10 * 60 }],
} satisfies Record<string, Window[]>;

export type RateLimitedAction = keyof typeof RATE_LIMITS;

/**
 * The visitor's IP. On Vercel both headers are set by the platform itself and
 * cannot be forged by the client.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

/** Only a hash of the IP is stored, never the address itself. */
function keyFor(action: RateLimitedAction, ip: string, window: Window): string {
  const hash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  return `${action}:${window.windowSeconds}:${hash}`;
}

/**
 * Counts one request and returns true when the visitor is still within every
 * window. If the limiter itself fails, the request is allowed: a broken
 * limiter must never lock real students out.
 */
export async function withinRateLimit(
  request: Request,
  action: RateLimitedAction,
): Promise<boolean> {
  const ip = clientIp(request);
  for (const window of RATE_LIMITS[action]) {
    const { data, error } = await supabaseService().rpc("hit_rate_limit", {
      p_key: keyFor(action, ip, window),
      p_limit: window.limit,
      p_window_seconds: window.windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] check failed", error);
      return true;
    }
    if (data === false) return false;
  }
  return true;
}

export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    {
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a few minutes and try again.",
      fieldErrors: {},
    },
    { status: 429, headers: { "Retry-After": "600" } },
  );
}
