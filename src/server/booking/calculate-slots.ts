export type SlotAppointment = {
  startTime: string;
  endTime: string;
  status?: string;
};

type CalculateAvailableSlotsInput = {
  openingTime: string;
  closingTime: string;
  durationMinutes: number;
  appointments: SlotAppointment[];
  stepMinutes?: number;
  minimumStartMinutes?: number | null;
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function timeToMinutes(time: string) {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

export function calculateAvailableSlotValues({
  openingTime,
  closingTime,
  durationMinutes,
  appointments,
  stepMinutes = 30,
  minimumStartMinutes = null,
}: CalculateAvailableSlotsInput) {
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);

  if (
    openingMinutes === null ||
    closingMinutes === null ||
    closingMinutes <= openingMinutes ||
    durationMinutes <= 0 ||
    stepMinutes <= 0
  ) {
    return [];
  }

  const latestStart = closingMinutes - durationMinutes;

  if (latestStart < openingMinutes) {
    return [];
  }

  const busyIntervals = appointments
    .filter((appointment) => appointment.status !== "CANCELLED")
    .map((appointment) => ({
      start: timeToMinutes(appointment.startTime),
      end: timeToMinutes(appointment.endTime),
    }))
    .filter(
      (
        interval,
      ): interval is {
        start: number;
        end: number;
      } =>
        interval.start !== null &&
        interval.end !== null &&
        interval.end > interval.start,
    );

  const availableSlots: string[] = [];

  for (
    let candidateStart = openingMinutes;
    candidateStart <= latestStart;
    candidateStart += stepMinutes
  ) {
    const candidateEnd = candidateStart + durationMinutes;

    if (minimumStartMinutes !== null && candidateStart <= minimumStartMinutes) {
      continue;
    }

    const overlapsExistingAppointment = busyIntervals.some(
      (appointment) =>
        candidateStart < appointment.end && candidateEnd > appointment.start,
    );

    if (!overlapsExistingAppointment) {
      availableSlots.push(minutesToTime(candidateStart));
    }
  }

  return availableSlots;
}
