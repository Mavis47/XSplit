import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = Number(req.nextUrl.searchParams.get("userId"));

  const admin = await prisma.groupMember.findFirst({
    where: {
      groupId: Number(id),
      userId,
      isAdmin: true,
    },
  });

  if (!admin) {
    return NextResponse.json(
      { message: "Only admin can delete the group" },
      { status: 403 }
    );
  }

  await prisma.group.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    message: "Group deleted successfully",
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { groupName, userId } = await req.json();

  const admin = await prisma.groupMember.findFirst({
    where: {
      groupId: Number(id),
      userId,
      isAdmin: true,
    },
  });

  if (!admin) {
    return NextResponse.json(
      { message: "Only admin can edit group" },
      { status: 403 }
    );
  }

  const group = await prisma.group.update({
    where: {
      id: Number(id),
    },
    data: {
      GroupName: groupName,
    },
  });

  return NextResponse.json(group);
}