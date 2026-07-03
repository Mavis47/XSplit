/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "isAdmin";

-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;
