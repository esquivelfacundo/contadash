-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "is_manually_modified" BOOLEAN NOT NULL DEFAULT false;
