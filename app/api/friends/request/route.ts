import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { senderId, receiverId } = await req.json();

        // Validation
        if (!senderId || !receiverId) {
            return NextResponse.json(
                { message: "senderId and receiverId are required." },
                { status: 400 }
            );
        }

        // Can't send request to yourself
        if (senderId === receiverId) {
            return NextResponse.json(
                { message: "You cannot send a friend request to yourself." },
                { status: 400 }
            );
        }

        // Receiver exists?
        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId,
            },
        });

        if (!receiver) {
            return NextResponse.json(
                { message: "Receiver not found." },
                { status: 404 }
            );
        }

        // Already friends?
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        user1Id: senderId,
                        user2Id: receiverId,
                    },
                    {
                        user1Id: receiverId,
                        user2Id: senderId,
                    },
                ],
            },
        });

        if (friendship) {
            return NextResponse.json(
                { message: "You are already friends." },
                { status: 400 }
            );
        }

        // Existing request?
        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    {
                        senderId,
                        receiverId,
                    },
                    {
                        senderId: receiverId,
                        receiverId: senderId,
                    },
                ],
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { message: "Friend request already exists." },
                { status: 400 }
            );
        }

        // Create request
        const result = await prisma.$transaction(async (tx) => {
        const request = await tx.friendRequest.create({
            data: {
            senderId,
            receiverId,
            },
            include: {
            sender: {
                select: {
                id: true,
                username: true,
                fullname: true,
                },
            },
            receiver: {
                select: {
                id: true,
                username: true,
                fullname: true,
                },
            },
            },
        });

        await tx.notifications.create({
            data: {
            userId: receiverId,
            message: `${request.sender.fullname} sent you a friend request.`,
            },
        });

        return request;
        });

        return NextResponse.json(
        {
            message: "Friend request sent successfully.",
            request: result,
        },
        { status: 201 }
        );

        
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.nextUrl.searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required." },
        { status: 400 }
      );
    }

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
            fullname: true,
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

  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const friendId = Number(req.nextUrl.searchParams.get("friendId"));

  const user1Id = Math.min(userId, friendId);
  const user2Id = Math.max(userId, friendId);

  await prisma.friendship.delete({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  return NextResponse.json({
    message: "Friend removed successfully.",
  });

}