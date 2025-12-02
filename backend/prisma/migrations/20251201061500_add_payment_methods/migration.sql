-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "bank_account_id" TEXT,
ADD COLUMN     "payment_method" "PaymentMethod";

-- CreateIndex
CREATE INDEX "transactions_bank_account_id_idx" ON "transactions"("bank_account_id");

-- CreateIndex
CREATE INDEX "transactions_payment_method_idx" ON "transactions"("payment_method");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
