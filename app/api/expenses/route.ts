import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {description,amount,ownerId,paidById,groupId,splitType,splits} = await req.json();

    if (!description || !amount || !ownerId || !paidById) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check owner
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

    // Check paidBy
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

    // -----------------------------
    // PERSONAL EXPENSE
    // -----------------------------
    if (!groupId) {
      const expense = await prisma.expense.create({
        data: {
          description,
          amount,
          ownerId,
          paidById,
          groupId: null,
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
                  fullname: true,
                },
              },
            },
          },
        },
      });

      // Notify group members except payer
      const members = await tx.groupMember.findMany({
        where: {
          groupId,
        },
      });

      for (const member of members) {
        if (member.userId === paidById) continue;

        await tx.notifications.create({
          data: {
            userId: member.userId,
            message: `${owner.fullname} added "${description}" to the group.`,
          },
        });
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