import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { publishNotification } from "@/lib/kafka/notification";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { message: "requestId is required." },
        { status: 400 }
      );
    }

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

    // Ensure the logged-in user is the receiver
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

      if (process.env.USE_KAFKA === "true") {
        await publishNotification({
          type: "friend_request_accepted",
          senderId: request.senderId,
          receiverName: request.receiver.name,
        });
      } else {
        await tx.notifications.create({
          data: {
            userId: request.senderId,
            message: `${request.receiver.name} accepted your friend request.`,
            isRead: false,
          },
        });
      }
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