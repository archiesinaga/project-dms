-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "backupFrequency" TEXT NOT NULL,
    "retentionPeriod" INTEGER NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL,
    "systemMaintenanceMode" BOOLEAN NOT NULL,
    "maxFileSize" INTEGER NOT NULL,
    "allowedFileTypes" TEXT[],
    "autoApprovalTimeout" INTEGER NOT NULL,
    "passwordPolicy" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
