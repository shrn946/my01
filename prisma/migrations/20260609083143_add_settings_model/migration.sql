-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "senderName" TEXT,
    "senderEmail" TEXT,
    "resendApiKey" TEXT,
    "companyName" TEXT,
    "portfolioUrl" TEXT,
    "demoWebsiteUrls" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
