import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAvailableSlotValues,
  minutesToTime,
  timeToMinutes,
} from "../src/server/booking/calculate-slots";

test("time conversion helpers convert valid appointment times", () => {
  assert.equal(timeToMinutes("09:30"), 570);
  assert.equal(timeToMinutes("23:59"), 1439);

  assert.equal(minutesToTime(570), "09:30");
  assert.equal(minutesToTime(0), "00:00");
});

test("timeToMinutes rejects invalid time values", () => {
  assert.equal(timeToMinutes("25:00"), null);
  assert.equal(timeToMinutes("10:75"), null);
  assert.equal(timeToMinutes("invalid"), null);
});

test("creates 30-minute slot intervals inside opening hours", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "12:00",
    durationMinutes: 60,
    appointments: [],
  });

  assert.deepEqual(slots, ["09:00", "09:30", "10:00", "10:30", "11:00"]);
});

test("removes slots that overlap an existing appointment", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "12:00",
    durationMinutes: 60,
    appointments: [
      {
        startTime: "10:00",
        endTime: "11:00",
        status: "CONFIRMED",
      },
    ],
  });

  assert.deepEqual(slots, ["09:00", "11:00"]);
});

test("appointments touching a slot boundary do not overlap", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "12:00",
    durationMinutes: 60,
    appointments: [
      {
        startTime: "10:00",
        endTime: "11:00",
      },
    ],
  });

  assert.ok(slots.includes("09:00"));
  assert.ok(slots.includes("11:00"));
  assert.equal(slots.includes("09:30"), false);
  assert.equal(slots.includes("10:00"), false);
  assert.equal(slots.includes("10:30"), false);
});

test("supports services longer than one hour", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "12:00",
    durationMinutes: 90,
    appointments: [],
  });

  assert.deepEqual(slots, ["09:00", "09:30", "10:00", "10:30"]);
});

test("cancelled appointments do not block availability", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "12:00",
    durationMinutes: 60,
    appointments: [
      {
        startTime: "10:00",
        endTime: "11:00",
        status: "CANCELLED",
      },
    ],
  });

  assert.deepEqual(slots, ["09:00", "09:30", "10:00", "10:30", "11:00"]);
});

test("same-day availability excludes past and current times", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "13:00",
    durationMinutes: 60,
    appointments: [],
    minimumStartMinutes: 10 * 60 + 15,
  });

  assert.deepEqual(slots, ["10:30", "11:00", "11:30", "12:00"]);
});

test("returns no slots when the service is longer than opening hours", () => {
  const slots = calculateAvailableSlotValues({
    openingTime: "09:00",
    closingTime: "10:00",
    durationMinutes: 90,
    appointments: [],
  });

  assert.deepEqual(slots, []);
});

test("returns no slots for invalid or closed opening hours", () => {
  assert.deepEqual(
    calculateAvailableSlotValues({
      openingTime: "17:00",
      closingTime: "09:00",
      durationMinutes: 60,
      appointments: [],
    }),
    [],
  );

  assert.deepEqual(
    calculateAvailableSlotValues({
      openingTime: "invalid",
      closingTime: "17:00",
      durationMinutes: 60,
      appointments: [],
    }),
    [],
  );
});
