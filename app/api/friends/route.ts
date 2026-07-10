import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { redis } from "@/lib/redis/redis";

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

    const cacheKey = `friends:${userId}`;

    const cachedFriends = await redis.get(cacheKey);

    if (cachedFriends) {
      console.log("✅ Returning friends from Redis");

      return NextResponse.json(JSON.parse(cachedFriends));
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            user1Id: userId,
          },
          {
            user2Id: userId,
          },
        ],
      },

      include: {
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const friends = friendships.map((friendship) =>
      friendship.user1Id === userId
        ? friendship.user2
        : friendship.user1
    );

    await redis.set(
      cacheKey,
      JSON.stringify(friends),
      "EX",
      300 // 5 minutes
    );

    return NextResponse.json(friends);
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