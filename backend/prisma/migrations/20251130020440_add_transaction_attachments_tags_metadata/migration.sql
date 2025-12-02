/*
  Warnings:

  - You are about to drop the column `name` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,company]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Made the column `company` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "clients_user_id_name_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "name",
ADD COLUMN     "responsible" VARCHAR(100),
ALTER COLUMN "company" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "attachment_url" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "clients_user_id_company_key" ON "clients"("user_id", "company");

-- CreateIndex
CREATE INDEX "transactions_tags_idx" ON "transactions"("tags");
