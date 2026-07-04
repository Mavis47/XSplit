import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const groupName = req.nextUrl.searchParams.get("name");

    if (!groupName) {
      return NextResponse.json(
        { message: "Group name is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findMany({
      where: {
        GroupName: {
         contains: groupName,
         mode: "insensitive",
        },
      },
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
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}