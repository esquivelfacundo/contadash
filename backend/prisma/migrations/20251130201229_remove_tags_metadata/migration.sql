/*
  Warnings:

  - You are about to drop the column `metadata` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `transactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "transactions_tags_idx";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "metadata",
DROP COLUMN "tags";
