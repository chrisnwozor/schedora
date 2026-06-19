export class BookingInputError extends Error {
  readonly field: string;

  constructor(field: string) {
    super(`${field} is required.`);
    this.name = "BookingInputError";
    this.field = field;
  }
}

function getTrimmedText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function requireBookingText(
  value: FormDataEntryValue | null,
  field: string,
) {
  const text = getTrimmedText(value);

  if (!text) {
    throw new BookingInputError(field);
  }

  return text;
}

export function optionalBookingText(value: FormDataEntryValue | null) {
  const text = getTrimmedText(value);

  return text || null;
}

export function normalizeBookingContact(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isBookingBotTrapFilled(value: FormDataEntryValue | null) {
  return optionalBookingText(value) !== null;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function addMinutesToBookingTime(time: string, minutesToAdd: number) {
  const match = TIME_PATTERN.exec(time);

  if (!match || !Number.isInteger(minutesToAdd) || minutesToAdd <= 0) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  const totalMinutes = hour * 60 + minute + minutesToAdd;

  if (totalMinutes >= 24 * 60) {
    return null;
  }

  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
    totalMinutes % 60,
  ).padStart(2, "0")}`;
}
