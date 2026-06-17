-- CreateEnum
CREATE TYPE "AppointmentEventType" AS ENUM ('STATUS_CHANGED', 'RESCHEDULED', 'CANCELLED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "appointment_events" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "AppointmentEventType" NOT NULL,
    "fromStatus" "AppointmentStatus",
    "toStatus" "AppointmentStatus",
    "previousDate" TIMESTAMP(3),
    "nextDate" TIMESTAMP(3),
    "previousStartTime" TEXT,
    "nextStartTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_events_businessId_createdAt_idx" ON "appointment_events"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "appointment_events_appointmentId_createdAt_idx" ON "appointment_events"("appointmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "appointment_events" ADD CONSTRAINT "appointment_events_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_events" ADD CONSTRAINT "appointment_events_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_events" ADD CONSTRAINT "appointment_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
