-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "Account" (
    "accountId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dailyWithdrawalLimit" DECIMAL(15,2) NOT NULL,
    "activeFlag" BOOLEAN NOT NULL DEFAULT true,
    "accountType" INTEGER NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transactionId")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;
