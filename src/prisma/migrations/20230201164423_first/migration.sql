/*
  Warnings:

  - You are about to alter the column `phone` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Added the required column `reviewIdInStore` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "reviewIdInStore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "phone" SET DATA TYPE INTEGER;
