-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_code_expires" TIMESTAMP(3);
