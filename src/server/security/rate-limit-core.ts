import { createHash } from "crypto";

export function normalizeIp(value: string | null) {
  if (!value) {
    return "unknown";
  }

  return value.split(",")[0]?.trim() || "unknown";
}

export function normalizeUserAgent(
  value: string | null,
  maximumLength = 500,
) {
  if (!value) {
    return null;
  }

  return value.slice(0, maximumLength);
}

export function hashRateLimitValue(
  value: string,
  secret: string,
) {
  return createHash("sha256")
    .update(`${secret}:${value}`)
    .digest("hex");
}

export function isRateLimitAllowed(
  attempts: number,
  maxAttempts: number,
) {
  if (maxAttempts <= 0) {
    return false;
  }

  return attempts < maxAttempts;
}

export function getRateLimitWindowStart(
  windowSeconds: number,
  now = new Date(),
) {
  if (windowSeconds <= 0) {
    throw new Error(
      "Rate-limit window must be greater than zero.",
    );
  }

  return new Date(
    now.getTime() - windowSeconds * 1000,
  );
}