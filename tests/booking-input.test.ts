import assert from "node:assert/strict";
import test from "node:test";

import {
  addMinutesToBookingTime,
  BookingInputError,
  isBookingBotTrapFilled,
  normalizeBookingContact,
  optionalBookingText,
  requireBookingText,
} from "../src/server/booking/booking-input";

test("requireBookingText trims valid input", () => {
  assert.equal(requireBookingText("  Haircut  ", "Service"), "Haircut");
});

test("requireBookingText rejects missing input", () => {
  assert.throws(
    () => requireBookingText(null, "Customer name"),
    (error) =>
      error instanceof BookingInputError &&
      error.message === "Customer name is required.",
  );
});

test("requireBookingText rejects blank input", () => {
  assert.throws(
    () => requireBookingText("     ", "Phone number"),
    /Phone number is required/,
  );
});

test("optionalBookingText returns trimmed text or null", () => {
  assert.equal(optionalBookingText("  customer note  "), "customer note");

  assert.equal(optionalBookingText("   "), null);

  assert.equal(optionalBookingText(null), null);
});

test("normalizeBookingContact normalizes email addresses", () => {
  assert.equal(
    normalizeBookingContact("  USER@Example.COM "),
    "user@example.com",
  );
});

test("normalizeBookingContact removes whitespace from phone numbers", () => {
  assert.equal(normalizeBookingContact(" +1 519 555 0000 "), "+15195550000");
});

test("bot trap detects filled values", () => {
  assert.equal(isBookingBotTrapFilled("https://spam.example"), true);

  assert.equal(isBookingBotTrapFilled(""), false);

  assert.equal(isBookingBotTrapFilled(null), false);
});

test("adds service duration to a booking time", () => {
  assert.equal(addMinutesToBookingTime("09:00", 60), "10:00");

  assert.equal(addMinutesToBookingTime("09:45", 90), "11:15");
});

test("rejects invalid appointment times", () => {
  assert.equal(addMinutesToBookingTime("25:00", 60), null);

  assert.equal(addMinutesToBookingTime("10:75", 60), null);

  assert.equal(addMinutesToBookingTime("invalid", 60), null);
});

test("rejects invalid service durations and midnight overflow", () => {
  assert.equal(addMinutesToBookingTime("10:00", 0), null);

  assert.equal(addMinutesToBookingTime("10:00", -30), null);

  assert.equal(addMinutesToBookingTime("23:30", 60), null);
});
