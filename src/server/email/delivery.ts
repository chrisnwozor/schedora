import "server-only";

import type { EmailDeliveryType, Prisma } from "@prisma/client";
import { Resend } from "resend";

import { logger } from "@/lib/logger";
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

  logger.info("email.delivery.queued", {
    deliveryId: delivery.id,
    businessId: input.businessId,
    appointmentId: input.appointmentId ?? null,
    type: input.type,
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
    logger.warn("email.delivery.not_found", {
      deliveryId,
    });

    return;
  }

  if (delivery.status === "SENT" || delivery.status === "LOGGED") {
    logger.info("email.delivery.skipped", {
      deliveryId: delivery.id,
      businessId: delivery.businessId,
      appointmentId: delivery.appointmentId,
      type: delivery.type,
      status: delivery.status,
    });

    return;
  }

  if (getEmailMode() === "log") {
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

    logger.info("email.delivery.logged", {
      deliveryId: delivery.id,
      businessId: delivery.businessId,
      appointmentId: delivery.appointmentId,
      type: delivery.type,
    });

    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    const configurationError = "RESEND_API_KEY or EMAIL_FROM is missing.";

    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        lastError: configurationError,
      },
    });

    logger.warn("email.delivery.configuration_missing", {
      deliveryId: delivery.id,
      businessId: delivery.businessId,
      appointmentId: delivery.appointmentId,
      type: delivery.type,
      missingApiKey: !apiKey,
      missingFromAddress: !from,
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

      logger.error("email.delivery.provider_failed", new Error(error.message), {
        deliveryId: delivery.id,
        businessId: delivery.businessId,
        appointmentId: delivery.appointmentId,
        type: delivery.type,
        provider: delivery.provider,
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

    logger.info("email.delivery.sent", {
      deliveryId: delivery.id,
      businessId: delivery.businessId,
      appointmentId: delivery.appointmentId,
      type: delivery.type,
      provider: delivery.provider,
      providerMessageId: data?.id ?? null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown email delivery failure.";

    await prisma.emailDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        lastError: errorMessage,
      },
    });

    logger.error("email.delivery.unexpected_failure", error, {
      deliveryId: delivery.id,
      businessId: delivery.businessId,
      appointmentId: delivery.appointmentId,
      type: delivery.type,
      provider: delivery.provider,
    });
  }
}

export async function deliverEmailDeliveries(deliveryIds: string[]) {
  const results = await Promise.allSettled(
    deliveryIds.map((deliveryId) => deliverEmailDelivery(deliveryId)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.error("email.delivery.unhandled_failure", result.reason, {
        deliveryId: deliveryIds[index],
      });
    }
  });
}
