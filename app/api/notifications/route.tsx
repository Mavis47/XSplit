import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notifications.findMany({
      where: {
        userId: Number(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("NOTIFICATIONS API ERROR");
    console.error(error);
    console.error(error.message);
    console.error(error.stack);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}