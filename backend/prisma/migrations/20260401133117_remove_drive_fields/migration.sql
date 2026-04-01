/*
  Warnings:

  - You are about to drop the column `driveFileCount` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `driveFolderId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `driveFolderLink` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "driveFileCount",
DROP COLUMN "driveFolderId",
DROP COLUMN "driveFolderLink";
