/*
  Warnings:

  - Added the required column `userCity` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userState` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userCity" TEXT NOT NULL,
ADD COLUMN     "userState" TEXT NOT NULL;
