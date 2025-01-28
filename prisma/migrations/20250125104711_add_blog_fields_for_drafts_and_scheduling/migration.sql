-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';
