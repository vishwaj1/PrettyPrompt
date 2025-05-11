-- CreateTable
CREATE TABLE "UserCreatedTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCreatedTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCreatedTemplate_userId_createdAt_idx" ON "UserCreatedTemplate"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserCreatedTemplate" ADD CONSTRAINT "UserCreatedTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
