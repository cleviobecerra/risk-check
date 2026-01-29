-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TestRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rut" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costCenter" TEXT NOT NULL,
    "businessUnit" TEXT NOT NULL,
    "subArea" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    CONSTRAINT "Worker_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TestRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TestResult_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_workerId_key" ON "TestResult"("workerId");
