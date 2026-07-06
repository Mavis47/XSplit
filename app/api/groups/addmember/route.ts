import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);

        const { groupId, friendIds } = await req.json();

        if (!groupId) {
            return NextResponse.json(
                { message: "groupId is required." },
                { status: 400 }
            );
        }

        if (!Array.isArray(friendIds) || friendIds.length === 0) {
            return NextResponse.json(
                { message: "friendIds are required." },
                { status: 400 }
            );
        }

        // Check group exists
        const group = await prisma.group.findUnique({
            where: {
                id: groupId,
            },
        });

        if (!group) {
            return NextResponse.json(
                { message: "Group not found." },
                { status: 404 }
            );
        }

        // Logged-in user must belong to the group
        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
            },
        });

        if (!isMember) {
            return NextResponse.json(
                { message: "You are not a member of this group." },
                { status: 403 }
            );
        }

        // Existing members
        // Verify that all selected users are actually friends
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        user1Id: userId,
                        user2Id: {
                            in: friendIds,
                        },
                    },
                    {
                        user2Id: userId,
                        user1Id: {
                            in: friendIds,
                        },
                    },
                ],
            },
        });

        const validFriendIds = friendships.map((friendship) =>
            friendship.user1Id === userId
                ? friendship.user2Id
                : friendship.user1Id
        );

        // Existing group members
        const existingMembers = await prisma.groupMember.findMany({
            where: {
                groupId,
            },
            select: {
                userId: true,
            },
        });

        const existingIds = new Set(
            existingMembers.map((m) => m.userId)
        );

        // Only friends who aren't already members
        const newFriendIds = validFriendIds.filter(
            (id) => !existingIds.has(id)
        );


        if (newFriendIds.length === 0) {
            return NextResponse.json(
                { message: "All selected friends are already in the group." },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.groupMember.createMany({
                data: newFriendIds.map((id: number) => ({
                    groupId,
                    userId: id,
                })),
            });

            await tx.notifications.createMany({
                data: newFriendIds.map((id: number) => ({
                    userId: id,
                    message: `You have been added to "${group.GroupName}".`,
                })),
            });
        });

        return NextResponse.json({
            message: `${newFriendIds.length} friend(s) added successfully.`,
        });
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