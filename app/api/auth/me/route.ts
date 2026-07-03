import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));

  if (!id) {
    return NextResponse.json(
      { message: "User id required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      fullname: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}