import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const account = await prisma.account.findUnique({
      where: { email },
    });

    if (!account) {
      return NextResponse.json(
        { message: "ไม่พบอีเมลนี้ในระบบ" },
        { status: 404 },
      );
    }

    const token = randomBytes(32).toString("hex");

    await prisma.passwordResetToken.deleteMany({
      where: { accountId: account.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        token,
        accountId: account.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // 🔥 สร้าง transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 🔥 ส่งเมล
    await transporter.sendMail({
      from: `"ReWaste" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "รีเซ็ตรหัสผ่าน ReWaste",
      html: `
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:10px 20px;
           background:#0a7cff;color:white;
           text-decoration:none;border-radius:6px;">
           รีเซ็ตรหัสผ่าน
        </a>
        <p>ลิงก์นี้จะหมดอายุใน 30 นาที</p>
      `,
    });

    return NextResponse.json({
      message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 },
    );
  }
}
