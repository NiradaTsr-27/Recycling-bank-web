export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {

      try {

      try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "MEMBER") {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { oldPassword, newPassword } = await req.json();
        if (!oldPassword || !newPassword) {
          return NextResponse.json(
            { message: "กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่" },
            { status: 400 }
          );
        }
        const account = await prisma.account.findUnique({
          where: { id: Number(session.user.id) },
        });
        if (!account) {
          return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }
        // Check old password
        const isMatch = await bcrypt.compare(oldPassword, account.password);
        if (!isMatch) {
          return NextResponse.json(
            { message: "รหัสผ่านเดิมไม่ถูกต้อง" },
            { status: 400 }
          );
        }
        if (newPassword.length < 6) {
          return NextResponse.json(
            { message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
            { status: 400 }
          );
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword },
        });
        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
      } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
          { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
          { status: 500 }
        );
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}