-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    CONSTRAINT "TestRequest_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestRequest" ("createdAt", "id", "scheduledFor", "solicitanteId", "status") SELECT "createdAt", "id", "scheduledFor", "solicitanteId", "status" FROM "TestRequest";
DROP TABLE "TestRequest";
ALTER TABLE "new_TestRequest" RENAME TO "TestRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
