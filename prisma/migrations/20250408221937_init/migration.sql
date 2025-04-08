-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "userAPeerId" TEXT NOT NULL,
    "userBPeerId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);
