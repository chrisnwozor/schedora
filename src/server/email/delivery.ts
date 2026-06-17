import "server-only";

import type { EmailDeliveryType, Prisma } from "@prisma/client";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

type EmailDatabaseClient = Pick<Prisma.TransactionClient, "emailDelivery">;

type QueueEmailInput = {
  businessId: string;
  appointmentId?: string | null;
  type: EmailDeliveryType;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export async function queueEmailDelivery(
  client: EmailDatabaseClient,
  input: QueueEmailInput,
) {
  const delivery = await client.emailDelivery.upsert({
    where: {
      idempotencyKey: input.idempotencyKey,
    },
    update: {},
    create: {
      businessId: input.businessId,
      appointmentId: input.appointmentId ?? null,
      type: input.type,
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName ?? null,
      subject: input.subject,
      htmlBody: input.html,
      textBody: input.text,
      idempotencyKey: input.idempotencyKey,
    },
    select: {
      id: true,
    },
  });

  return delivery.id;
}

function getEmailMode() {
  return process.env.EMAIL_MODE === "send" ? "send" : "log";
}

export async function deliverEmailDelivery(deliveryId: string) {
  const delivery = await prisma.emailDelivery.findUnique({
    where: {
      id: deliveryId,
    },
  });

  if (!delivery) {
    return;
  }

  if (delivery.status === "SENT" || delivery.status === "LOGGED") {
    return;
  }

  if (getEmailMode() === "log") {
    console.info("[Schedora email log]", {
      deliveryId: delivery.id,
      type: delivery.type,
      subject: delivery.subject,
    });

    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "LOGGED",
        attempts: {
          increment: 1,
        },
        lastError: "EMAIL_MODE is set to log. No external email was sent.",
      },
    });

    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        lastError: "RESEND_API_KEY or EMAIL_FROM is missing.",
      },
    });

    return;
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send(
      {
        from,
        to: [delivery.recipientEmail],
        subject: delivery.subject,
        html: delivery.htmlBody,
        text: delivery.textBody,
        tags: [
          {
            name: "delivery_type",
            value: delivery.type.toLowerCase(),
          },
          {
            name: "business_id",
            value: delivery.businessId,
          },
        ],
      },
      {
        idempotencyKey: delivery.idempotencyKey,
      },
    );

    if (error) {
      await prisma.emailDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: "FAILED",
          attempts: {
            increment: 1,
          },
          lastError: error.message,
        },
      });

      return;
    }

    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "SENT",
        attempts: {
          increment: 1,
        },
        providerMessageId: data?.id ?? null,
        sentAt: new Date(),
        lastError: null,
      },
    });
  } catch (error) {
    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        lastError:
          error instanceof Error
            ? error.message
            : "Unknown email delivery failure.",
      },
    });
  }
}

export async function deliverEmailDeliveries(deliveryIds: string[]) {
  await Promise.allSettled(
    deliveryIds.map((deliveryId) => deliverEmailDelivery(deliveryId)),
  );
}
