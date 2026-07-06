-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "fullname" DROP NOT NULL;
