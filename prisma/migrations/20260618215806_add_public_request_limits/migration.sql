-- CreateTable
CREATE TABLE "public_request_logs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "slug" TEXT,
    "action" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_request_logs_businessId_action_createdAt_idx" ON "public_request_logs"("businessId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "public_request_logs_slug_action_createdAt_idx" ON "public_request_logs"("slug", "action", "createdAt");

-- CreateIndex
CREATE INDEX "public_request_logs_identifierHash_action_createdAt_idx" ON "public_request_logs"("identifierHash", "action", "createdAt");

-- CreateIndex
CREATE INDEX "public_request_logs_allowed_createdAt_idx" ON "public_request_logs"("allowed", "createdAt");

-- AddForeignKey
ALTER TABLE "public_request_logs" ADD CONSTRAINT "public_request_logs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
