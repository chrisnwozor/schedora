import "server-only";

import { createHash } from "crypto";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

type PublicRequestContext = {
  ipAddress: string;
  ipHash: string;
  userAgent: string | null;
};

type RateLimitInput = {
  action: string;
  identifier: string;
  context: PublicRequestContext;
  maxAttempts: number;
  windowSeconds: number;
  slug?: string | null;
  businessId?: string | null;
  blockedMessage?: string;
};

function getRateLimitSecret() {
  return (
    process.env.RATE_LIMIT_SECRET ?? "schedora-development-rate-limit-secret"
  );
}

function hashValue(value: string) {
  return createHash("sha256")
    .update(`${getRateLimitSecret()}:${value}`)
    .digest("hex");
}

function normalizeIp(value: string | null) {
  if (!value) {
    return "unknown";
  }

  return value.split(",")[0]?.trim() || "unknown";
}

function normalizeUserAgent(value: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 500);
}

export async function getPublicRequestContext(): Promise<PublicRequestContext> {
  const headerStore = await headers();

  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const cloudflareIp = headerStore.get("cf-connecting-ip");

  const ipAddress = normalizeIp(cloudflareIp ?? realIp ?? forwardedFor);

  return {
    ipAddress,
    ipHash: hashValue(`ip:${ipAddress}`),
    userAgent: normalizeUserAgent(headerStore.get("user-agent")),
  };
}

export async function checkPublicRateLimit(input: RateLimitInput) {
  const identifierHash = hashValue(input.identifier);

  const windowStart = new Date(Date.now() - input.windowSeconds * 1000);

  const attempts = await prisma.publicRequestLog.count({
    where: {
      action: input.action,
      identifierHash,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  const allowed = attempts < input.maxAttempts;

  await prisma.publicRequestLog.create({
    data: {
      businessId: input.businessId ?? null,
      slug: input.slug ?? null,
      action: input.action,
      identifierHash,
      ipHash: input.context.ipHash,
      userAgent: input.context.userAgent,
      allowed,
      reason: allowed ? "ALLOWED" : "RATE_LIMITED",
    },
  });

  return {
    allowed,
    message:
      input.blockedMessage ??
      "Too many requests. Please wait a few minutes and try again.",
  };
}

export async function recordPublicBotTrap(input: {
  context: PublicRequestContext;
  slug?: string | null;
  businessId?: string | null;
  action: string;
}) {
  await prisma.publicRequestLog.create({
    data: {
      businessId: input.businessId ?? null,
      slug: input.slug ?? null,
      action: input.action,
      identifierHash: hashValue(`${input.action}:${input.context.ipAddress}`),
      ipHash: input.context.ipHash,
      userAgent: input.context.userAgent,
      allowed: false,
      reason: "BOT_TRAP",
    },
  });
}
