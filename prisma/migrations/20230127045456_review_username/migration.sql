/*
  Warnings:

  - Added the required column `userName` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `productInfo` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userName" TEXT NOT NULL,
ALTER COLUMN "productInfo" SET NOT NULL;
