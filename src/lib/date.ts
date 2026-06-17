type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  const value = parts.find((part) => part.type === type)?.value;

  if (!value) {
    throw new Error(`Unable to calculate date part: ${type}.`);
  }

  return Number(value);
}

export function getCalendarDatePartsInTimeZone(
  timeZone: string,
  date = new Date(),
): CalendarDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
  };
}

export function getDateInputValueInTimeZone(
  timeZone: string,
  date = new Date(),
) {
  const { year, month, day } = getCalendarDatePartsInTimeZone(timeZone, date);

  return `${String(year).padStart(4, "0")}-${String(month).padStart(
    2,
    "0",
  )}-${String(day).padStart(2, "0")}`;
}

export function getTimeMinutesInTimeZone(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = getPart(parts, "hour");
  const minute = getPart(parts, "minute");

  return hour * 60 + minute;
}

export function parseDateInputAsUtc(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValid ? date : null;
}

export function getTodayDateRangeForTimeZone(
  timeZone: string,
  now = new Date(),
) {
  const todayInput = getDateInputValueInTimeZone(timeZone, now);
  const start = parseDateInputAsUtc(todayInput);

  if (!start) {
    throw new Error("Unable to calculate today.");
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start,
    end,
    dateInput: todayInput,
  };
}

export function getMonthDateRangeForTimeZone(
  timeZone: string,
  now = new Date(),
) {
  const { year, month } = getCalendarDatePartsInTimeZone(timeZone, now);

  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
    month,
    year,
  };
}

export function getMonthKeyInTimeZone(timeZone: string, now = new Date()) {
  const { year, month } = getCalendarDatePartsInTimeZone(timeZone, now);

  return {
    month,
    year,
  };
}

export function isDateInputBeforeTodayInTimeZone(
  dateInput: string,
  timeZone: string,
  now = new Date(),
) {
  if (!parseDateInputAsUtc(dateInput)) {
    return true;
  }

  const today = getDateInputValueInTimeZone(timeZone, now);

  return dateInput < today;
}

/**
 * Legacy helper for browser-only use.
 *
 * Server code should use getDateInputValueInTimeZone with the
 * business timezone.
 */
export function getLocalDateInputValue(date = new Date()) {
  const runtimeTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return getDateInputValueInTimeZone(runtimeTimeZone, date);
}
