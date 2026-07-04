import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { requestId, userId } = await req.json();

    const request = await prisma.friendRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Friend request not found." },
        { status: 404 }
      );
    }

    if (request.receiverId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { message: "Request already processed." },
        { status: 400 }
      );
    }

    const user1Id = Math.min(request.senderId, request.receiverId);
    const user2Id = Math.max(request.senderId, request.receiverId);

    await prisma.$transaction(async (tx) => {
      await tx.friendRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      await tx.friendship.create({
        data: {
          user1Id,
          user2Id,
        },
      });

      await tx.notifications.create({
        data: {
          userId: request.senderId,
          message: `${request.receiver.fullname} accepted your friend request.`,
        },
      });
    });

    return NextResponse.json({
      message: "Friend request accepted.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}