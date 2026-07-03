import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";


export async function POST(req: NextRequest) {
  try {
    const { username, fullname, email, password } = await req.json();

    if (!username || !fullname || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}