import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireEmployee } from "@/lib/authEmployee";
//////////////////////////////////////////////////////
// UPDATE PASSWORD
//////////////////////////////////////////////////////
export async function PUT(req: Request) {

      try {

      try {
        const session = await requireEmployee();
        const { oldPassword, newPassword } = await req.json();
        const account = await prisma.account.findUnique({
          where: { id: Number(session.user.id) },
        });
        if (!account) {
          return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
        }
        const isMatch = await bcrypt.compare(oldPassword, account.password);
        if (!isMatch) {
          return NextResponse.json(
            { error: "รหัสผ่านเดิมไม่ถูกต้อง" },
            { status: 400 },
          );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword },
        });
        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
      } catch (error: any) {
        console.error("PUT CHANGE PASSWORD ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          { error: "Internal Server Error" },
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