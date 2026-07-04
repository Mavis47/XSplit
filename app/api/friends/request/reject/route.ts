import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest) {
  try {

    const { requestId, userId } = await req.json();

    const request = await prisma.friendRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Request not found." },
        { status: 404 }
      );
    }

    if (request.receiverId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
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