-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "price" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "description" TEXT,
    "notes" TEXT,
    "driveFolderId" TEXT,
    "driveFolderLink" TEXT,
    "driveFileCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
