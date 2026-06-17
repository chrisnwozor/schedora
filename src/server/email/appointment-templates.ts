import "server-only";

import { formatDate, formatTime } from "@/lib/format";

type AppointmentEmailData = {
  businessName: string;
  customerName: string;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  staffName?: string | null;
};

type RescheduledEmailData = AppointmentEmailData & {
  previousDate: Date;
  previousStartTime: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appointmentSummary(data: AppointmentEmailData) {
  const staffLine = data.staffName
    ? `
      <tr>
        <td style="padding:8px 0;color:#737373;">Staff</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">
          ${escapeHtml(data.staffName)}
        </td>
      </tr>
    `
    : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:24px;">
      <tr>
        <td style="padding:8px 0;color:#737373;">Service</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">
          ${escapeHtml(data.serviceName)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#737373;">Date</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">
          ${escapeHtml(formatDate(data.date))}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#737373;">Time</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">
          ${escapeHtml(formatTime(data.startTime))} – ${escapeHtml(
            formatTime(data.endTime),
          )}
        </td>
      </tr>
      ${staffLine}
    </table>
  `;
}

function emailFrame({
  heading,
  introduction,
  content,
  businessName,
}: {
  heading: string;
  introduction: string;
  content: string;
  businessName: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#111111;">
        <div style="padding:32px 16px;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;padding:32px;">
            <div style="font-size:22px;font-weight:700;margin-bottom:32px;">
              schedora
            </div>

            <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px;">
              ${escapeHtml(heading)}
            </h1>

            <p style="font-size:16px;line-height:1.7;color:#525252;margin:0;">
              ${escapeHtml(introduction)}
            </p>

            ${content}

            <p style="font-size:13px;line-height:1.6;color:#737373;margin:32px 0 0;">
              This notification was sent by ${escapeHtml(
                businessName,
              )} through Schedora.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function bookingRequestedCustomerTemplate(data: AppointmentEmailData) {
  const subject = `Booking request received — ${data.businessName}`;

  const text = [
    `Hello ${data.customerName},`,
    "",
    `Your booking request with ${data.businessName} has been received.`,
    `Service: ${data.serviceName}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
    "",
    "The business will review and confirm your appointment.",
  ].join("\n");

  const html = emailFrame({
    heading: "Booking request received",
    introduction: `Hello ${data.customerName}, your appointment request has been received. The business will review it shortly.`,
    content: appointmentSummary(data),
    businessName: data.businessName,
  });

  return { subject, text, html };
}

export function newBookingOwnerTemplate(
  data: AppointmentEmailData & {
    customerPhone: string;
    customerEmail?: string | null;
  },
) {
  const subject = `New booking request from ${data.customerName}`;

  const contactLines = [
    `Customer: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
    data.customerEmail ? `Email: ${data.customerEmail}` : null,
  ].filter(Boolean);

  const text = [
    "A new booking request was created.",
    "",
    ...contactLines,
    `Service: ${data.serviceName}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
  ].join("\n");

  const html = emailFrame({
    heading: "New booking request",
    introduction: `${data.customerName} submitted a new appointment request.`,
    content: `
      ${appointmentSummary(data)}

      <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:12px;">
        <p style="margin:0 0 8px;"><strong>Customer contact</strong></p>
        <p style="margin:0;color:#525252;">Phone: ${escapeHtml(
          data.customerPhone,
        )}</p>
        ${
          data.customerEmail
            ? `<p style="margin:8px 0 0;color:#525252;">Email: ${escapeHtml(
                data.customerEmail,
              )}</p>`
            : ""
        }
      </div>
    `,
    businessName: data.businessName,
  });

  return { subject, text, html };
}

export function appointmentConfirmedTemplate(data: AppointmentEmailData) {
  const subject = `Appointment confirmed — ${data.businessName}`;

  const text = [
    `Hello ${data.customerName},`,
    "",
    `Your appointment with ${data.businessName} has been confirmed.`,
    `Service: ${data.serviceName}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
  ].join("\n");

  const html = emailFrame({
    heading: "Appointment confirmed",
    introduction: `Hello ${data.customerName}, your appointment has been confirmed.`,
    content: appointmentSummary(data),
    businessName: data.businessName,
  });

  return { subject, text, html };
}

export function appointmentCancelledTemplate(
  data: AppointmentEmailData & {
    reason: string;
  },
) {
  const subject = `Appointment cancelled — ${data.businessName}`;

  const text = [
    `Hello ${data.customerName},`,
    "",
    `Your appointment with ${data.businessName} has been cancelled.`,
    `Service: ${data.serviceName}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
    `Reason: ${data.reason}`,
  ].join("\n");

  const html = emailFrame({
    heading: "Appointment cancelled",
    introduction: `Hello ${data.customerName}, your appointment has been cancelled.`,
    content: `
      ${appointmentSummary(data)}

      <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:12px;">
        <p style="margin:0 0 8px;"><strong>Cancellation reason</strong></p>
        <p style="margin:0;color:#525252;">
          ${escapeHtml(data.reason)}
        </p>
      </div>
    `,
    businessName: data.businessName,
  });

  return { subject, text, html };
}

export function appointmentRescheduledTemplate(data: RescheduledEmailData) {
  const subject = `Appointment rescheduled — ${data.businessName}`;

  const text = [
    `Hello ${data.customerName},`,
    "",
    `Your appointment with ${data.businessName} has been rescheduled.`,
    `Previous: ${formatDate(data.previousDate)} at ${formatTime(
      data.previousStartTime,
    )}`,
    `New date: ${formatDate(data.date)}`,
    `New time: ${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
    `Service: ${data.serviceName}`,
  ].join("\n");

  const html = emailFrame({
    heading: "Appointment rescheduled",
    introduction: `Hello ${data.customerName}, the schedule for your appointment has changed.`,
    content: `
      <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:12px;">
        <p style="margin:0 0 8px;"><strong>Previous schedule</strong></p>
        <p style="margin:0;color:#525252;">
          ${escapeHtml(formatDate(data.previousDate))} at
          ${escapeHtml(formatTime(data.previousStartTime))}
        </p>
      </div>

      <p style="font-size:15px;font-weight:600;margin:24px 0 0;">
        New schedule
      </p>

      ${appointmentSummary(data)}
    `,
    businessName: data.businessName,
  });

  return { subject, text, html };
}
