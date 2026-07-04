import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { groupName, userId } = await req.json();

    if (!groupName || !userId) {
      return NextResponse.json(
        { message: "groupName and userId are required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get All Group
export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        members: {
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