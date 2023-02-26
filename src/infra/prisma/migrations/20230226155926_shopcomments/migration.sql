-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "shopkeeperComment" TEXT,
ADD COLUMN     "statusCommented" BOOLEAN NOT NULL DEFAULT false;
