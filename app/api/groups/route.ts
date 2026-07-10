import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis/redis";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { groupName } = await req.json();

  const userId = Number(session.user.id);

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

  return NextResponse.json(group);
}

// Get All Group
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

     const cacheKey = `groups:${userId}`;

    const cachedGroups = await redis.get(cacheKey);

    if (cachedGroups) {
      console.log("✅ Returning groups from Redis");
      return NextResponse.json(JSON.parse(cachedGroups));
    }

    console.log("❌ Cache Miss - Fetching groups from Database");

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },

      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },

        members: {
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

        expenses: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    await redis.set(
      cacheKey,
      JSON.stringify(groups),
      "EX",
      300 // 5 minutes
    );

    console.log("💾 Stored groups in Redis");

    return NextResponse.json(groups);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}