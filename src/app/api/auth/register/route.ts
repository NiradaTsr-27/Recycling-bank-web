import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";


export async function POST(req: Request) {

      try {

      try {
        const body = await req.json();
        const {
          username,
          password,
          nationalId,
          firstName,
          lastName,
          phone,
          email, // Optional for members in this context, but supported
        } = body;
        //////////////////////////////////////////////////////
        // REQUIRED VALIDATION
        //////////////////////////////////////////////////////
        if (!username || !password || !firstName || !lastName || !nationalId) {
          return NextResponse.json(
            { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
            { status: 400 },
          );
        }
        //////////////////////////////////////////////////////
        // VALIDATE NATIONAL ID (13 digits)
        //////////////////////////////////////////////////////
        if (!/^\d{13}$/.test(nationalId)) {
          return NextResponse.json(
            { field: "nationalId", message: "เลขบัตรประชาชนต้องมี 13 หลัก" },
            { status: 400 },
          );
        }
        //////////////////////////////////////////////////////
        // VALIDATE PHONE (10 digits if provided)
        //////////////////////////////////////////////////////
        if (phone && !/^\d{10}$/.test(phone)) {
          return NextResponse.json(
            { field: "phone", message: "เบอร์โทรศัพท์ต้องมี 10 หลัก" },
            { status: 400 },
          );
        }
        //////////////////////////////////////////////////////
        // VALIDATE EMAIL FORMAT
        //////////////////////////////////////////////////////
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return NextResponse.json(
            { field: "email", message: "รูปแบบ Email ไม่ถูกต้อง" },
            { status: 400 },
          );
        }
        //////////////////////////////////////////////////////
        // CHECK DUPLICATES
        //////////////////////////////////////////////////////
        // username
        const existingUsername = await prisma.account.findUnique({
          where: { username },
        });
        if (existingUsername) {
          return NextResponse.json(
            { field: "username", message: "Username นี้ถูกใช้แล้ว" },
            { status: 400 },
          );
        }
        // email
        if (email) {
          const existingEmail = await prisma.account.findUnique({
            where: { email },
          });
          if (existingEmail) {
            return NextResponse.json(
              { field: "email", message: "Email นี้ถูกใช้แล้ว" },
              { status: 400 },
            );
          }
        }
        // phone
        if (phone) {
          const existingPhone = await prisma.member.findUnique({
            where: { phone },
          });
          if (existingPhone) {
            return NextResponse.json(
              { field: "phone", message: "เบอร์โทรศัพท์นี้ถูกใช้แล้ว" },
              { status: 400 },
            );
          }
        }
        // nationalId
        const existingNationalId = await prisma.member.findUnique({
          where: { nationalId },
        });
        if (existingNationalId) {
          return NextResponse.json(
            { field: "nationalId", message: "เลขบัตรประชาชนนี้ถูกใช้แล้ว" },
            { status: 400 },
          );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        //////////////////////////////////////////////////////
        // TRANSACTION (ป้องกันข้อมูลค้าง)
        //////////////////////////////////////////////////////
        const result = await prisma.$transaction(async (tx) => {
          // Create Account (Using random fallback email if not provided since Prisma unique on email might choke if left empty but email schema requires unique. Wait, in schema, email is unique but does it allow multiple nulls? Wait, email is defined as String @unique, not String? @unique! Ah!)
          // Wait, let's look at schema.prisma: email String @unique.
          // If the email field is strictly required by the db, we must provide it. We will enforce email.
          if (!email) {
            throw new Error("EMAIL_REQUIRED");
          }
          const newAccount = await tx.account.create({
            data: {
              username,
              email: email, 
              password: hashedPassword,
            },
          });
          const newMember = await tx.member.create({
            data: {
              nationalId,
              firstName,
              lastName,
              phone: phone || null,
              isActive: true, // Auto Active
              accountId: newAccount.id,
              wallet: {
                create: {}, // Auto initialize wallet
              },
            },
          });
          return newMember;
        });
        return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
      } catch (error: any) {
        console.error("REGISTER MEMBER ERROR:", error);
        if (error.message === "EMAIL_REQUIRED") {
            return NextResponse.json(
                { field: "email", message: "กรุณาระบุ Email สำหรับใช้งานระบบ" },
                { status: 400 },
            );
        }
        if (error.code === "P2002") {
          const target = error.meta?.target?.[0] || error.meta?.target;
          if (typeof target === 'string') {
            if (target.includes("phone")) {
                return NextResponse.json({ field: "phone", message: "เบอร์โทรศัพท์นี้ถูกใช้แล้ว" }, { status: 400 });
            }
            if (target.includes("nationalId")) {
                return NextResponse.json({ field: "nationalId", message: "เลขบัตรประชาชนนี้ถูกใช้แล้ว" }, { status: 400 });
            }
            if (target.includes("username")) {
                return NextResponse.json({ field: "username", message: "Username นี้ถูกใช้แล้ว" }, { status: 400 });
            }
            if (target.includes("email")) {
                return NextResponse.json({ field: "email", message: "Email นี้ถูกใช้แล้ว" }, { status: 400 });
            }
          }
        }
        return NextResponse.json(
          { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก โปรดลองอีกครั้ง" },
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