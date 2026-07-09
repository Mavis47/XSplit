import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { publishNotification } from "@/lib/kafka/notification";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const senderId = Number(session.user.id);

    const { receiverId } = await req.json();

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiverId is required." },
        { status: 400 }
      );
    }

    const receiverIdNum = Number(receiverId);

    if (senderId === receiverIdNum) {
      return NextResponse.json(
        { message: "You cannot send request to yourself." },
        { status: 400 }
      );
    }

    // Receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverIdNum },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: "Receiver not found." },
        { status: 404 }
      );
    }

    // Already friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverIdNum },
          { user1Id: receiverIdNum, user2Id: senderId },
        ],
      },
    });

    if (friendship) {
      return NextResponse.json(
        { message: "Already friends." },
        { status: 400 }
      );
    }

    // Existing request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiverIdNum },
          { senderId: receiverIdNum, receiverId: senderId },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { message: "Request already exists." },
        { status: 400 }
      );
    }

    // Create request
    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.friendRequest.create({
        data: {
          senderId,
          receiverId: receiverIdNum,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      });

      if (process.env.USE_KAFKA === "true") {
        await publishNotification({
          type: "friend_request",
          receiverId: receiverIdNum,
          senderName: created.sender.name,
        });
      } else {
        await tx.notifications.create({
          data: {
            userId: receiverIdNum,
            message: `${created.sender.name} sent you a friend request.`,
            isRead: false,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      {
        message: "Friend request sent successfully.",
        request,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const friendId = Number(req.nextUrl.searchParams.get("friendId"));

    if (!friendId) {
      return NextResponse.json(
        { message: "friendId is required." },
        { status: 400 }
      );
    }

    const user1Id = Math.min(userId, friendId);
    const user2Id = Math.max(userId, friendId);

    const friendship = await prisma.friendship.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { message: "Friendship not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.friendship.delete({
        where: {
          user1Id_user2Id: {
            user1Id,
            user2Id,
          },
        },
      });

      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: friendId,
            },
            {
              senderId: friendId,
              receiverId: userId,
            },
          ],
        },
      });
    });

    return NextResponse.json({
      message: "Friend removed successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}