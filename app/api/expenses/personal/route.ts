import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.nextUrl.searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required." },
        { status: 400 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        ownerId: userId,
        groupId: null,
      },

      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        paidBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
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