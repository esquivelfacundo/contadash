-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('SAVINGS', 'CHECKING', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ARS', 'USD');

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "account_type" "BankAccountType" NOT NULL,
    "account_number" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "balance" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_is_active_idx" ON "bank_accounts"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_currency_idx" ON "bank_accounts"("user_id", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_user_id_account_number_bank_key" ON "bank_accounts"("user_id", "account_number", "bank");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
