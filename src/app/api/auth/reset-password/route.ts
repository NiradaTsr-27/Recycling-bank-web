import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";


export async function POST(req: Request) {

      try {

      try {
        const { token, password } = await req.json();
        if (!token || !password) {
          return NextResponse.json({ message: "ข้อมูลไม่ครบ" }, { status: 400 });
        }
        // หา token ใน DB
        const resetToken = await prisma.passwordResetToken.findUnique({
          where: { token },
        });
        if (!resetToken) {
          return NextResponse.json(
            { message: "Token ไม่ถูกต้อง" },
            { status: 400 },
          );
        }
        // เช็คหมดอายุ
        if (resetToken.expiresAt < new Date()) {
          return NextResponse.json(
            { message: "Token หมดอายุแล้ว" },
            { status: 400 },
          );
        }
        // hash password ใหม่
        const hashedPassword = await bcrypt.hash(password, 10);
        // อัปเดต password
        await prisma.account.update({
          where: { id: resetToken.accountId },
          data: { password: hashedPassword },
        });
        // ลบ token ทิ้ง
        await prisma.passwordResetToken.delete({
          where: { token },
        });
        return NextResponse.json({
          message: "รีเซ็ตรหัสผ่านสำเร็จ",
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
          { status: 500 },
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