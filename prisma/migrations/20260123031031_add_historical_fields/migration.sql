-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isHistorical" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "TestResult_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestResult" ("id", "isDraft", "status", "workerId") SELECT "id", "isDraft", "status", "workerId" FROM "TestResult";
DROP TABLE "TestResult";
ALTER TABLE "new_TestResult" RENAME TO "TestResult";
CREATE UNIQUE INDEX "TestResult_workerId_key" ON "TestResult"("workerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
