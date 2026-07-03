import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
      },
    });

  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}