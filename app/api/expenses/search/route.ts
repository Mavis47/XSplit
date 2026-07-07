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

    const search = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    const expenses = await prisma.expense.findMany({
      where: {
        AND: [
          {
            OR: [
              // Personal expenses
              {
                ownerId: userId,
              },

              // Group expenses
              {
                group: {
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            ],
          },

          search
            ? {
                OR: [
                  {
                    description: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },

                  {
                    paidBy: {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },

                  {
                    group: {
                      GroupName: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {},
        ],
      },

      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },

        owner: {
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

    const formatted = expenses.map((expense) => {
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

      const isAdmin =
        expense.group?.members.some(
          (m) => m.userId === userId && m.isAdmin
        ) ?? false;

      return {
        ...expense,
        canEdit: isAdmin,
        canDelete: isAdmin,
        youWillPay,
        youWillGet,
      };
    });

    return NextResponse.json(formatted);
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