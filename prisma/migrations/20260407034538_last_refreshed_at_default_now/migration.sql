/*
  Warnings:

  - Made the column `lastRefreshedAt` on table `waitlist_member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "waitlist_member" ALTER COLUMN "lastRefreshedAt" SET NOT NULL,
ALTER COLUMN "lastRefreshedAt" SET DEFAULT CURRENT_TIMESTAMP;
