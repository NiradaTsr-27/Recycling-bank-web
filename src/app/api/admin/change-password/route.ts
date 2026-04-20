import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
export const fetchCache = "force-no-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { oldPassword, newPassword } = await req.json();
  const account = await prisma.account.findUnique({
    where: { id: Number(session.user.id) },
  });
  if (!account) {
    return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 });
  }
  const isMatch = await bcrypt.compare(oldPassword, account.password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "รหัสผ่านเดิมไม่ถูกต้อง" },
      { status: 400 },
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.account.update({
    where: { id: account.id },
    data: { password: hashedPassword },
  });
  return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
}