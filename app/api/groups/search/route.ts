import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const groupName = req.nextUrl.searchParams.get("name") ?? "";

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
        GroupName: {
          contains: groupName,
          mode: "insensitive",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        expenses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}