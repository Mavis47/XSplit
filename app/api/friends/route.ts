import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {

  const userId = Number(req.nextUrl.searchParams.get("userId"));

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
      user1: true,
      user2: true,
    },

  });

  const friends = friendships.map((friendship) => {

    if (friendship.user1Id === userId) {
      return friendship.user2;
    }

    return friendship.user1;

  });

  return NextResponse.json(friends);

}