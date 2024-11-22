-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "isPoll" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pollExpiresAt" TIMESTAMP(3),
ADD COLUMN     "totalVotes" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "text" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "text" VARCHAR(100) NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "tweetId" TEXT NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
