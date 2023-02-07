/*
  Warnings:

  - Added the required column `userMail` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPhone` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userMail" TEXT NOT NULL,
ADD COLUMN     "userPhone" TEXT NOT NULL;
