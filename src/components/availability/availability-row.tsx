"use client";
import { useState } from "react";
import { updateAvailabilityRuleAction } from "@/server/actions/business-records";
import { Button } from "@/components/ui/button";
type AvailabilityRowProps = {
  id: string;
  dayLabel: string;
  initialIsClosed: boolean;
  initialStartTime: string;
  initialEndTime: string;
};
export function AvailabilityRow({
  id,
  dayLabel,
  initialIsClosed,
  initialStartTime,
  initialEndTime,
}: AvailabilityRowProps) {
  const [isClosed, setIsClosed] = useState(initialIsClosed);
  const [startTime, setStartTime] = useState(
    initialStartTime === "00:00" ? "09:00" : initialStartTime,
  );
  const [endTime, setEndTime] = useState(
    initialEndTime === "00:00" ? "17:00" : initialEndTime,
  );
  return (
    <form
      action={updateAvailabilityRuleAction}
      className="rounded-2xl border border-neutral-200 p-4 sm:p-5"
    >
      {" "}
      <input type="hidden" name="availabilityRuleId" value={id} />{" "}
      <div className="flex items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <p className="font-semibold">{dayLabel}</p>{" "}
          <p className="mt-1 text-sm text-neutral-500">
            {" "}
            {isClosed ? "Closed to bookings" : "Open for bookings"}{" "}
          </p>{" "}
        </div>{" "}
        <label className="flex shrink-0 items-center gap-2 text-sm text-neutral-600">
          {" "}
          <input
            name="isClosed"
            type="checkbox"
            checked={isClosed}
            onChange={(event) => setIsClosed(event.target.checked)}
            className="size-4"
          />{" "}
          Closed{" "}
        </label>{" "}
      </div>{" "}
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
        {" "}
        <div className="min-w-0">
          {" "}
          <label htmlFor={`${id}-start`} className="text-sm text-neutral-500">
            {" "}
            Start time{" "}
          </label>{" "}
          <input
            id={`${id}-start`}
            name="startTime"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            disabled={isClosed}
            required={!isClosed}
            className="mt-2 block h-12 w-full min-w-0 max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
          />{" "}
        </div>{" "}
        <div className="min-w-0">
          {" "}
          <label htmlFor={`${id}-end`} className="text-sm text-neutral-500">
            {" "}
            End time{" "}
          </label>{" "}
          <input
            id={`${id}-end`}
            name="endTime"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            disabled={isClosed}
            required={!isClosed}
            className="mt-2 block h-12 w-full min-w-0 max-w-full rounded-xl border border-neutral-200 bg-white px-3 text-base outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="mt-5 flex justify-end">
        {" "}
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          {" "}
          Save day{" "}
        </Button>{" "}
      </div>{" "}
    </form>
  );
}
