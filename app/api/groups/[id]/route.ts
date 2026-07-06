import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const groupId = Number(id);
    const userId = Number(session.user.id);

    const admin = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        isAdmin: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Only group admins can delete the group." },
        { status: 403 }
      );
    }

    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    return NextResponse.json({
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { groupName } = await req.json();

    if (!groupName?.trim()) {
      return NextResponse.json(
        { message: "Group name is required" },
        { status: 400 }
      );
    }

    const groupId = Number(id);
    const userId = Number(session.user.id);

    const admin = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        isAdmin: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Only admins can edit the group." },
        { status: 403 }
      );
    }

    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        GroupName: groupName.trim(),
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }
    const { id } = await params;

    console.log("id:", id);

    const groupId = Number(id);

    if (!groupId) {
      return NextResponse.json(
        { message: "Group ID is required." },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: {
        id: Number(groupId),
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Group not found." },
        { status: 404 }
      );
    }

    // Optional: ensure the logged-in user belongs to the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: Number(groupId),
        userId: Number(session.user.id),
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this group." },
        { status: 403 }
      );
    }

    const members = await prisma.groupMember.findMany({
      where: {
        groupId: Number(groupId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        userId: "asc",
      },
    });

    return NextResponse.json(
      members.map((member) => member.user)
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}