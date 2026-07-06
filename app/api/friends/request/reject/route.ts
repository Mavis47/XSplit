import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

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
    });

    if (!request) {
      return NextResponse.json(
        { message: "Friend request not found." },
        { status: 404 }
      );
    }

    // Only the receiver can reject the request
    if (request.receiverId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { message: "Request has already been processed." },
        { status: 400 }
      );
    }

    await prisma.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      message: "Friend request rejected.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}