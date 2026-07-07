import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// --------------------
// UPDATE EXPENSE
// --------------------
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { id } = await params;
    const expenseId = Number(id);

    const {
      description,
      amount,
      paidById,
      splitType,
      splits,
    } = await req.json();

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found." },
        { status: 404 }
      );
    }

    // -------------------
    // PERSONAL EXPENSE
    // -------------------
    if (!expense.groupId) {
      if (expense.ownerId !== userId) {
        return NextResponse.json(
          {
            message: "Only the expense owner can edit this expense.",
          },
          {
            status: 403,
          }
        );
      }

      const updatedExpense = await prisma.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          description,
          amount,
          paidById,
        },
      });

      return NextResponse.json({
        message: "Expense updated successfully.",
        expense: updatedExpense,
      });
    }

    // -------------------
    // GROUP EXPENSE
    // -------------------

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: expense.groupId,
          userId,
        },
      },
    });

    if (!member || !member.isAdmin) {
      return NextResponse.json(
        {
          message: "Only the group admin can edit this expense.",
        },
        {
          status: 403,
        }
      );
    }

    const updatedExpense = await prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({
        where: {
          expenseId,
        },
      });

      return tx.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          description,
          amount,
          paidById,
          splitType,

          splits: {
            create: splits,
          },
        },

        include: {
          splits: true,
        },
      });
    });

    return NextResponse.json({
      message: "Expense updated successfully.",
      expense: updatedExpense,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

// --------------------
// DELETE EXPENSE
// --------------------

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { id } = await params;
    const expenseId = Number(id);

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: "Expense not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Personal expense
    if (!expense.groupId) {
      if (expense.ownerId !== userId) {
        return NextResponse.json(
          {
            message: "Only the owner can delete this expense.",
          },
          {
            status: 403,
          }
        );
      }

      await prisma.expense.delete({
        where: {
          id: expenseId,
        },
      });

      return NextResponse.json({
        message: "Expense deleted successfully.",
      });
    }

    // Group expense
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: expense.groupId,
          userId,
        },
      },
    });

    if (!member || !member.isAdmin) {
      return NextResponse.json(
        {
          message: "Only the group admin can delete this expense.",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({
      message: "Expense deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}