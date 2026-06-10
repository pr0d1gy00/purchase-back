/*
  Warnings:

  - You are about to drop the column `globalExchangeRate` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `priceInVes` on the `PurchaseItem` table. All the data in the column will be lost.
  - The `preferredCurrency` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `DailyExchangeRate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `localCurrencyPrice` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `originalCurrency` on the `PurchaseItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "globalExchangeRate",
ADD COLUMN     "appliedExchangeRate" DECIMAL(18,4),
ADD COLUMN     "exchangeRateSource" TEXT,
ADD COLUMN     "localCurrency" TEXT DEFAULT 'VES';

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "priceInVes",
ADD COLUMN     "exchangeRateSource" TEXT,
ADD COLUMN     "localCurrency" TEXT NOT NULL DEFAULT 'VES',
ADD COLUMN     "localCurrencyPrice" DECIMAL(18,2) NOT NULL,
DROP COLUMN "originalCurrency",
ADD COLUMN     "originalCurrency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferredCurrency",
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'USD';

-- DropTable
DROP TABLE "DailyExchangeRate";

-- DropEnum
DROP TYPE "Currency";

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "targetCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,4) NOT NULL,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExchangeRate_targetCurrency_source_date_idx" ON "ExchangeRate"("targetCurrency", "source", "date");
