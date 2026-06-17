import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Mail, Phone, User } from "lucide-react";
import {
  cancelAppointmentAction,
  updateAppointmentStatusAction,
} from "@/server/actions/business-records";
import { getActiveBusiness } from "@/server/business/get-active-business";
import { prisma } from "@/lib/prisma";
import {
  cleanEnum,
  formatDate,
  formatDateInput,
  formatDateTime,
  formatTime,
} from "@/lib/format";
import { RescheduleAppointmentForm } from "@/components/appointments/reschedule-appointment-form";
import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default async function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await getActiveBusiness();
  const appointment = await prisma.appointment.findFirst({
    where: { id, businessId: business.id },
    include: {
      customer: true,
      service: true,
      staffMember: true,
      events: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      },
    },
  });
  if (!appointment) {
    notFound();
  }
  const [services, staffMembers] = await Promise.all([
    prisma.service.findMany({
      where: {
        businessId: business.id,
        OR: [{ isActive: true }, { id: appointment.serviceId }],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, durationMinutes: true },
    }),
    prisma.staffMember.findMany({
      where: {
        businessId: business.id,
        OR: [
          { isActive: true },
          appointment.staffMemberId ? { id: appointment.staffMemberId } : {},
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const canReschedule =
    appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED";
  const canCancel =
    appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED";
  return (
    <div>
      {" "}
      <ModuleHeader
        title="Appointment details"
        description={`${appointment.customer.name} — ${formatDate(appointment.date)}`}
        action={
          <Link
            href="/appointments"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
          >
            {" "}
            Back to appointments{" "}
          </Link>
        }
      />{" "}
      <main className="space-y-6 p-4 sm:p-6 lg:p-10">
        {" "}
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {" "}
          <div className="space-y-6">
            {" "}
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {" "}
                  <CardTitle>Appointment</CardTitle>{" "}
                  <Badge variant="secondary">
                    {" "}
                    {cleanEnum(appointment.status)}{" "}
                  </Badge>{" "}
                </div>{" "}
              </CardHeader>{" "}
              <CardContent className="grid gap-5 sm:grid-cols-2">
                {" "}
                <Info
                  icon={Calendar}
                  label="Date"
                  value={formatDate(appointment.date)}
                />{" "}
                <Info
                  icon={Clock}
                  label="Time"
                  value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`}
                />{" "}
                <Info
                  icon={User}
                  label="Service"
                  value={appointment.service.name}
                />{" "}
                <Info
                  icon={User}
                  label="Staff"
                  value={appointment.staffMember?.name ?? "Unassigned"}
                />{" "}
              </CardContent>{" "}
            </Card>{" "}
            {canReschedule ? (
              <Card className="rounded-2xl border-neutral-200 shadow-none">
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle>Reschedule appointment</CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <RescheduleAppointmentForm
                    appointmentId={appointment.id}
                    businessSlug={business.slug}
                    initialServiceId={appointment.serviceId}
                    initialStaffMemberId={appointment.staffMemberId ?? ""}
                    initialDate={formatDateInput(appointment.date)}
                    initialStartTime={appointment.startTime}
                    services={services}
                    staffMembers={staffMembers}
                  />{" "}
                </CardContent>{" "}
              </Card>
            ) : null}{" "}
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Appointment history</CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-5">
                {" "}
                {appointment.events.map((event) => (
                  <div
                    key={event.id}
                    className="border-b border-neutral-100 pb-4 last:border-b-0"
                  >
                    {" "}
                    <div className="flex items-start justify-between gap-4">
                      {" "}
                      <div>
                        {" "}
                        <p className="font-medium">
                          {" "}
                          {cleanEnum(event.type)}{" "}
                        </p>{" "}
                        {event.type === "STATUS_CHANGED" ? (
                          <p className="mt-1 text-sm text-neutral-600">
                            {" "}
                            {event.fromStatus
                              ? cleanEnum(event.fromStatus)
                              : "Unknown"}{" "}
                            →{" "}
                            {event.toStatus
                              ? cleanEnum(event.toStatus)
                              : "Unknown"}{" "}
                          </p>
                        ) : null}{" "}
                        {event.type === "RESCHEDULED" ? (
                          <p className="mt-1 text-sm text-neutral-600">
                            {" "}
                            {event.previousDate
                              ? formatDate(event.previousDate)
                              : "Unknown"}{" "}
                            at{" "}
                            {event.previousStartTime
                              ? formatTime(event.previousStartTime)
                              : "Unknown"}{" "}
                            →{" "}
                            {event.nextDate
                              ? formatDate(event.nextDate)
                              : "Unknown"}{" "}
                            at{" "}
                            {event.nextStartTime
                              ? formatTime(event.nextStartTime)
                              : "Unknown"}{" "}
                          </p>
                        ) : null}{" "}
                        {event.reason ? (
                          <p className="mt-2 text-sm text-neutral-500">
                            {" "}
                            Reason: {event.reason}{" "}
                          </p>
                        ) : null}{" "}
                        <p className="mt-2 text-xs text-neutral-500">
                          {" "}
                          By{" "}
                          {event.actor?.name ??
                            event.actor?.email ??
                            "System"}{" "}
                        </p>{" "}
                      </div>{" "}
                      <p className="shrink-0 text-xs text-neutral-500">
                        {" "}
                        {formatDateTime(event.createdAt)}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
                <div>
                  {" "}
                  <p className="font-medium">Appointment created</p>{" "}
                  <p className="mt-2 text-xs text-neutral-500">
                    {" "}
                    {formatDateTime(appointment.createdAt)}{" "}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </div>{" "}
          <div className="space-y-6">
            {" "}
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Customer</CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-4">
                {" "}
                <Info
                  icon={User}
                  label="Name"
                  value={appointment.customer.name}
                />{" "}
                <Info
                  icon={Phone}
                  label="Phone"
                  value={appointment.customer.phone}
                />{" "}
                {appointment.customer.email ? (
                  <Info
                    icon={Mail}
                    label="Email"
                    value={appointment.customer.email}
                  />
                ) : null}{" "}
              </CardContent>{" "}
            </Card>{" "}
            <Card className="rounded-2xl border-neutral-200 shadow-none">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>Status actions</CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-3">
                {" "}
                {appointment.status === "PENDING" ? (
                  <StatusButton
                    appointmentId={appointment.id}
                    status="CONFIRMED"
                    label="Confirm appointment"
                  />
                ) : null}{" "}
                {appointment.status === "CONFIRMED" ? (
                  <>
                    {" "}
                    <StatusButton
                      appointmentId={appointment.id}
                      status="COMPLETED"
                      label="Mark completed"
                    />{" "}
                    <StatusButton
                      appointmentId={appointment.id}
                      status="NO_SHOW"
                      label="Mark no-show"
                    />{" "}
                  </>
                ) : null}{" "}
                {!canCancel && appointment.status !== "CANCELLED" ? (
                  <p className="text-sm text-neutral-500">
                    {" "}
                    No more status actions are available.{" "}
                  </p>
                ) : null}{" "}
              </CardContent>{" "}
            </Card>{" "}
            {canCancel ? (
              <Card className="rounded-2xl border-neutral-200 shadow-none">
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle>Cancel appointment</CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <form action={cancelAppointmentAction} className="space-y-4">
                    {" "}
                    <input
                      type="hidden"
                      name="appointmentId"
                      value={appointment.id}
                    />{" "}
                    <div className="grid gap-2">
                      {" "}
                      <label className="text-sm font-medium">
                        {" "}
                        Cancellation reason{" "}
                      </label>{" "}
                      <textarea
                        name="reason"
                        required
                        placeholder="Explain why the appointment is being cancelled."
                        className="min-h-24 rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none"
                      />{" "}
                    </div>{" "}
                    <Button type="submit" variant="outline" className="w-full">
                      {" "}
                      Cancel appointment{" "}
                    </Button>{" "}
                  </form>{" "}
                </CardContent>{" "}
              </Card>
            ) : null}{" "}
            {appointment.cancellationReason ? (
              <Card className="rounded-2xl border-neutral-200 shadow-none">
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle>Cancellation</CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <p className="text-sm leading-6 text-neutral-600">
                    {" "}
                    {appointment.cancellationReason}{" "}
                  </p>{" "}
                </CardContent>{" "}
              </Card>
            ) : null}{" "}
            {appointment.notes ? (
              <Card className="rounded-2xl border-neutral-200 shadow-none">
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle>Notes</CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <p className="text-sm leading-6 text-neutral-600">
                    {" "}
                    {appointment.notes}{" "}
                  </p>{" "}
                </CardContent>{" "}
              </Card>
            ) : null}{" "}
          </div>{" "}
        </section>{" "}
      </main>{" "}
    </div>
  );
}
function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {" "}
      <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-neutral-200">
        {" "}
        <Icon className="size-4" />{" "}
      </div>{" "}
      <div className="min-w-0">
        {" "}
        <p className="text-xs text-neutral-500">{label}</p>{" "}
        <p className="mt-1 break-words text-sm font-medium"> {value} </p>{" "}
      </div>{" "}
    </div>
  );
}
function StatusButton({
  appointmentId,
  status,
  label,
}: {
  appointmentId: string;
  status: "CONFIRMED" | "COMPLETED" | "NO_SHOW";
  label: string;
}) {
  return (
    <form action={updateAppointmentStatusAction}>
      {" "}
      <input type="hidden" name="appointmentId" value={appointmentId} />{" "}
      <input type="hidden" name="status" value={status} />{" "}
      <Button type="submit" variant="outline" className="w-full">
        {" "}
        {label}{" "}
      </Button>{" "}
    </form>
  );
}
