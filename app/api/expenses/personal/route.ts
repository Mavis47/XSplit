import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
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
        ownerId: userId,
        groupId: null,
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
        splits: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}