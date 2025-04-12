-- DropForeignKey
ALTER TABLE "JobResume" DROP CONSTRAINT "JobResume_jobId_fkey";

-- AlterTable
ALTER TABLE "JobResume" ADD COLUMN     "design" JSONB,
ALTER COLUMN "jobId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ResumeTemplate" ADD COLUMN     "design" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AIRateLimit" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "requestsPerMinute" INTEGER NOT NULL DEFAULT 5,
    "requestsPerHour" INTEGER NOT NULL DEFAULT 60,
    "requestsPerDay" INTEGER NOT NULL DEFAULT 700,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRateLimitUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRateLimitUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIRateLimit_clientId_key" ON "AIRateLimit"("clientId");

-- CreateIndex
CREATE INDEX "AIRateLimitUsage_userId_clientId_timestamp_idx" ON "AIRateLimitUsage"("userId", "clientId", "timestamp");

-- CreateIndex
CREATE INDEX "AIRateLimitUsage_timestamp_idx" ON "AIRateLimitUsage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AIRateLimitUsage_userId_clientId_timestamp_key" ON "AIRateLimitUsage"("userId", "clientId", "timestamp");

-- AddForeignKey
ALTER TABLE "JobResume" ADD CONSTRAINT "JobResume_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
