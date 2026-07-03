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