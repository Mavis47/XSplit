import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { groupName } = await req.json();

  const userId = Number(session.user.id);

  const group = await prisma.group.create({
    data: {
      GroupName: groupName,
      userId,
      members: {
        create: {
          userId,
          isAdmin: true,
        },
      },
    },
    include: {
      members: true,
    },
  });

  return NextResponse.json(group);
}

// Get All Group
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
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