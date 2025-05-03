-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "appealed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_tweetId_key" ON "Appeal"("tweetId");

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
