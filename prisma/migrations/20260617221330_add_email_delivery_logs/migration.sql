-- CreateEnum
CREATE TYPE "EmailDeliveryType" AS ENUM ('CUSTOMER_BOOKING_REQUESTED', 'OWNER_NEW_BOOKING', 'CUSTOMER_APPOINTMENT_CONFIRMED', 'CUSTOMER_APPOINTMENT_CANCELLED', 'CUSTOMER_APPOINTMENT_RESCHEDULED');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'LOGGED');

-- CreateTable
CREATE TABLE "email_deliveries" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "type" "EmailDeliveryType" NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "providerMessageId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_deliveries_idempotencyKey_key" ON "email_deliveries"("idempotencyKey");

-- CreateIndex
CREATE INDEX "email_deliveries_businessId_createdAt_idx" ON "email_deliveries"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "email_deliveries_appointmentId_createdAt_idx" ON "email_deliveries"("appointmentId", "createdAt");

-- CreateIndex
CREATE INDEX "email_deliveries_status_createdAt_idx" ON "email_deliveries"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
