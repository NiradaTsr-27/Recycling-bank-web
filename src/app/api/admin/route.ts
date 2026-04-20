import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;



//////////////////////////////////////////////////////
// GET ALL ADMINS
//////////////////////////////////////////////////////
export async function GET() {
  try {
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  try {
const admins = await prisma.admin.findMany({
      include: {
        account: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(admins);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
//////////////////////////////////////////////////////
// CREATE ADMIN
//////////////////////////////////////////////////////
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  try {
const body = await req.json();
    const { firstName, lastName, username, email, password, nationalId } = body;
    if (!firstName || !lastName || !username || !password || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    // validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }
    // เช็ค username ซ้ำ
    const existingUsername = await prisma.account.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }
    // เช็ค email ซ้ำ
    const existingEmail = await prisma.account.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        firstName,
        lastName,
        nationalId,
        account: {
          create: {
            username,
            email,
            password: hashedPassword,
          },
        },
      },
      include: {
        account: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 },
    );
  }
}