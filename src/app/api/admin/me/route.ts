export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

/* =========================
   GET : ดึงข้อมูล Admin
========================= */

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.account.findUnique({
    where: { id: Number(session.user.id) },
    include: {
      admin: true,
    },
  });

  if (!account || !account.admin) {
    return NextResponse.json(
      { message: "ไม่พบข้อมูลผู้ดูแล" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    firstName: account.admin.firstName,
    lastName: account.admin.lastName,
    username: account.username,
    email: account.email,
  });
}

/* =========================
   PUT : แก้ไขชื่อ นามสกุล
========================= */

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 },
      );
    }

    await prisma.admin.update({
      where: {
        accountId: Number(session.user.id),
      },
      data: {
        firstName,
        lastName,
      },
    });

    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("UPDATE ADMIN ERROR:", error);

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
