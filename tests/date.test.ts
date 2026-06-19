import assert from "node:assert/strict";
import test from "node:test";

import {
  getCalendarDatePartsInTimeZone,
  getDateInputValueInTimeZone,
  getMonthDateRangeForTimeZone,
  getMonthKeyInTimeZone,
  getTimeMinutesInTimeZone,
  getTodayDateRangeForTimeZone,
  isDateInputBeforeTodayInTimeZone,
  parseDateInputAsUtc,
} from "../src/lib/date";

test("parseDateInputAsUtc parses a valid calendar date", () => {
  const result = parseDateInputAsUtc("2026-06-18");

  assert.ok(result);
  assert.equal(result.toISOString(), "2026-06-18T00:00:00.000Z");
});

test("parseDateInputAsUtc accepts leap years and rejects invalid dates", () => {
  const leapDay = parseDateInputAsUtc("2024-02-29");

  assert.ok(leapDay);
  assert.equal(leapDay.toISOString(), "2024-02-29T00:00:00.000Z");

  assert.equal(parseDateInputAsUtc("2026-02-29"), null);
  assert.equal(parseDateInputAsUtc("2026-04-31"), null);
  assert.equal(parseDateInputAsUtc("2026-13-01"), null);
  assert.equal(parseDateInputAsUtc("not-a-date"), null);
});

test("timezone helpers calculate the correct calendar date", () => {
  const instant = new Date("2026-01-01T02:30:00.000Z");

  assert.equal(
    getDateInputValueInTimeZone("America/Toronto", instant),
    "2025-12-31",
  );

  assert.equal(
    getDateInputValueInTimeZone("Africa/Douala", instant),
    "2026-01-01",
  );

  assert.deepEqual(getCalendarDatePartsInTimeZone("America/Toronto", instant), {
    year: 2025,
    month: 12,
    day: 31,
  });
});

test("getTimeMinutesInTimeZone returns minutes after midnight", () => {
  const instant = new Date("2026-06-18T14:45:00.000Z");

  assert.equal(
    getTimeMinutesInTimeZone("America/Toronto", instant),
    10 * 60 + 45,
  );

  assert.equal(
    getTimeMinutesInTimeZone("Africa/Douala", instant),
    15 * 60 + 45,
  );
});

test("getTodayDateRangeForTimeZone uses the business calendar date", () => {
  const instant = new Date("2026-01-01T02:30:00.000Z");

  const range = getTodayDateRangeForTimeZone("America/Toronto", instant);

  assert.equal(range.dateInput, "2025-12-31");
  assert.equal(range.start.toISOString(), "2025-12-31T00:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-01-01T00:00:00.000Z");
});

test("month helpers use the month in the selected timezone", () => {
  const instant = new Date("2026-01-01T02:30:00.000Z");

  const range = getMonthDateRangeForTimeZone("America/Toronto", instant);

  assert.equal(range.year, 2025);
  assert.equal(range.month, 12);
  assert.equal(range.start.toISOString(), "2025-12-01T00:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-01-01T00:00:00.000Z");

  assert.deepEqual(getMonthKeyInTimeZone("America/Toronto", instant), {
    year: 2025,
    month: 12,
  });
});

test("isDateInputBeforeTodayInTimeZone rejects past and invalid dates", () => {
  const instant = new Date("2026-01-01T02:30:00.000Z");

  assert.equal(
    isDateInputBeforeTodayInTimeZone("2025-12-30", "America/Toronto", instant),
    true,
  );

  assert.equal(
    isDateInputBeforeTodayInTimeZone("2025-12-31", "America/Toronto", instant),
    false,
  );

  assert.equal(
    isDateInputBeforeTodayInTimeZone("2026-01-01", "America/Toronto", instant),
    false,
  );

  assert.equal(
    isDateInputBeforeTodayInTimeZone("invalid", "America/Toronto", instant),
    true,
  );
});
