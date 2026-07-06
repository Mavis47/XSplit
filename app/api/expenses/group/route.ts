import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

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

    const expenses = await prisma.expense.findMany({
      where: {
        groupId: {
          not: null,
        },

        group: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },

      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },

        paidBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },

        group: {
          select: {
            id: true,
            GroupName: true,
          },
        },

        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
      console.error("GROUP EXPENSE ERROR:");
  console.error(error);
  console.error(error.message);
  console.error(error.stack);

  return NextResponse.json(
    {
      message: error.message,
    },
    { status: 500 }
  );
  }
}