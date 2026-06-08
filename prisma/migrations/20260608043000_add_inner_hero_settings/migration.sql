-- CreateTable
CREATE TABLE "InnerHeroSettings" (
    "id" TEXT NOT NULL,
    "fallbackImage" TEXT NOT NULL,
    "overlayColor" TEXT NOT NULL DEFAULT '#07111f',
    "overlayOpacity" INTEGER NOT NULL DEFAULT 65,
    "titleColor" TEXT NOT NULL DEFAULT '#ffffff',
    "breadcrumbColor" TEXT NOT NULL DEFAULT '#dbeafe',
    "heroHeight" INTEGER NOT NULL DEFAULT 360,
    "backgroundPosition" TEXT NOT NULL DEFAULT 'center center',
    "backgroundAttachment" TEXT NOT NULL DEFAULT 'scroll',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InnerHeroSettings_pkey" PRIMARY KEY ("id")
);
