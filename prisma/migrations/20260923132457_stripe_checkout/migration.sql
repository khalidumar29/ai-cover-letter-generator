-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageId" TEXT,
    "packageName" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'stripe',
    "gatewaySessionId" TEXT,
    "failureCode" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "CreditPackage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amountCents", "completedAt", "createdAt", "credits", "currency", "failureCode", "gateway", "id", "packageId", "packageName", "reference", "status", "updatedAt", "userId") SELECT "amountCents", "completedAt", "createdAt", "credits", "currency", "failureCode", "gateway", "id", "packageId", "packageName", "reference", "status", "updatedAt", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
CREATE UNIQUE INDEX "Payment_gatewaySessionId_key" ON "Payment"("gatewaySessionId");
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
