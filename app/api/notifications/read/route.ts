import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.notifications.updateMany({
      where: {
        userId: Number(session.user.id),
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: "Notifications marked as read.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}