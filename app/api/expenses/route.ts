import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { publishNotification } from "@/lib/kafka/notification";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const ownerId = Number(session.user.id);

    const {
      description,
      amount,
      paidById,
      groupId,
      splitType,
      splits,
    } = await req.json();

    if (!description || !amount) {
      return NextResponse.json(
        {
          message: "Description and amount are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Logged in user
    const owner = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!owner) {
      return NextResponse.json(
        {
          message: "Owner not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------
    // PERSONAL EXPENSE
    // -----------------------------
    if (!groupId) {
      const expense = await prisma.expense.create({
        data: {
          description,
          amount,
          ownerId,
          paidById: ownerId,
          groupId: null,
        },
        include: {
          owner: true,
          paidBy: true,
          splits: true,
        },
      });

      return NextResponse.json(
        {
          message: "Personal expense created.",
          expense,
        },
        {
          status: 201,
        }
      );
    }

    // -----------------------------
    // GROUP EXPENSE
    // -----------------------------

    if (!paidById) {
      return NextResponse.json(
        {
          message: "Paid By is required.",
        },
        {
          status: 400,
        }
      );
    }

    const payer = await prisma.user.findUnique({
      where: {
        id: paidById,
      },
    });

    if (!payer) {
      return NextResponse.json(
        {
          message: "PaidBy user not found.",
        },
        {
          status: 404,
        }
      );
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          message: "Group not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!splitType) {
      return NextResponse.json(
        {
          message: "Split type is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!splits || splits.length === 0) {
      return NextResponse.json(
        {
          message: "Splits are required.",
        },
        {
          status: 400,
        }
      );
    }

    const expense = await prisma.$transaction(async (tx) => {
      const createdExpense = await tx.expense.create({
        data: {
          description,
          amount,
          ownerId,
          paidById,
          groupId,
          splitType,
          splits: {
            create: splits.map(
              (split: {
                userId: number;
                share: number;
              }) => ({
                userId: split.userId,
                share: split.share,
              })
            ),
          },
        },
        include: {
          owner: true,
          paidBy: true,
          group: true,
          splits: {
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
        },
      });

      const members = await tx.groupMember.findMany({
        where: {
          groupId,
        },
      });

      // Kafka Setup
      
      const recipients = members
        .filter((member) => member.userId !== paidById)
        .map((member) => member.userId);

      if (process.env.USE_KAFKA === "true") {
        await publishNotification({
          type: "expense_created",
          senderName: owner.name,
          description,
          recipients,
        });
      } else {
        for (const userId of recipients) {
          await tx.notifications.create({
            data: {
              userId,
              message: `${owner.name} added "${description}"`,
              isRead: false,
            },
          });
        }
      }

      return createdExpense;
    });

    return NextResponse.json(
      {
        message: "Group expense created.",
        expense,
      },
      {
        status: 201,
      }
    );
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