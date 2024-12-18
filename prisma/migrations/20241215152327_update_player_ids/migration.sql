/*
  Warnings:

  - You are about to drop the column `player_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "player_id",
ADD COLUMN     "playerIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
