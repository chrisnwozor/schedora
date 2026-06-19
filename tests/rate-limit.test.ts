import assert from "node:assert/strict";
import test from "node:test";

import {
  getRateLimitWindowStart,
  hashRateLimitValue,
  isRateLimitAllowed,
  normalizeIp,
  normalizeUserAgent,
} from "../src/server/security/rate-limit-core";

test("normalizeIp selects the first forwarded IP address", () => {
  assert.equal(normalizeIp("203.0.113.10, 198.51.100.20"), "203.0.113.10");

  assert.equal(normalizeIp(" 203.0.113.10 "), "203.0.113.10");
});

test("normalizeIp returns unknown when no address exists", () => {
  assert.equal(normalizeIp(null), "unknown");
  assert.equal(normalizeIp(""), "unknown");
  assert.equal(normalizeIp(" , "), "unknown");
});

test("normalizeUserAgent preserves normal values", () => {
  assert.equal(normalizeUserAgent("Mozilla/5.0"), "Mozilla/5.0");

  assert.equal(normalizeUserAgent(null), null);
});

test("normalizeUserAgent limits excessively long values", () => {
  const longUserAgent = "a".repeat(700);

  const result = normalizeUserAgent(longUserAgent);

  assert.ok(result);
  assert.equal(result.length, 500);
});

test("rate-limit hashes are deterministic", () => {
  const first = hashRateLimitValue("booking-ip:203.0.113.10", "test-secret");

  const second = hashRateLimitValue("booking-ip:203.0.113.10", "test-secret");

  assert.equal(first, second);
  assert.equal(first.length, 64);
});

test("different secrets produce different hashes", () => {
  const first = hashRateLimitValue("same-value", "secret-one");

  const second = hashRateLimitValue("same-value", "secret-two");

  assert.notEqual(first, second);
});

test("rate limit allows attempts below the maximum", () => {
  assert.equal(isRateLimitAllowed(0, 8), true);

  assert.equal(isRateLimitAllowed(7, 8), true);
});

test("rate limit blocks attempts at or above the maximum", () => {
  assert.equal(isRateLimitAllowed(8, 8), false);

  assert.equal(isRateLimitAllowed(9, 8), false);

  assert.equal(isRateLimitAllowed(0, 0), false);
});

test("getRateLimitWindowStart calculates the correct boundary", () => {
  const now = new Date("2026-06-18T12:00:00.000Z");

  const result = getRateLimitWindowStart(15 * 60, now);

  assert.equal(result.toISOString(), "2026-06-18T11:45:00.000Z");
});

test("getRateLimitWindowStart rejects invalid windows", () => {
  assert.throws(() => getRateLimitWindowStart(0), /greater than zero/);

  assert.throws(() => getRateLimitWindowStart(-10), /greater than zero/);
});
