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
          include: {
            members: {
              select: {
                userId: true,
                isAdmin: true,
              },
            },
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
    const formattedExpenses = expenses.map((expense) => {
      const mySplit = expense.splits.find(
        (split) => split.userId === userId
      );

      const myShare = mySplit?.share ?? 0;

      let youWillPay = 0;
      let youWillGet = 0;

      if (expense.paidById === userId) {
        youWillGet = expense.amount - myShare;
      } else {
        youWillPay = myShare;
      }

      const isAdmin = expense.group?.members.some(
        (member) =>
          member.userId === userId &&
          member.isAdmin
      );

      return {
        ...expense,
        youWillPay,
        youWillGet,
        canEdit: isAdmin,
        canDelete: isAdmin,
      };
    });

    return NextResponse.json(formattedExpenses);
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