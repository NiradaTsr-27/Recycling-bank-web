import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import bcrypt from "bcryptjs";

//////////////////////////////////////////////////////
// GET ALL MEMBERS
//////////////////////////////////////////////////////
export async function GET() {
  try {
    await requireAdmin();

    const members = await prisma.member.findMany({
      include: {
        account: {
          select: {
            username: true,
            email: true,
          },
        },
        wallet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

//////////////////////////////////////////////////////
// CREATE MEMBER
//////////////////////////////////////////////////////
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      username,
      email,
      password,
      nationalId,
      firstName,
      lastName,
      phone,
      houseNo,
      village,
      road,
      alley,
      subDistrict,
      district,
      province,
      postalCode,
    } = body;

    //////////////////////////////////////////////////////
    // REQUIRED VALIDATION
    //////////////////////////////////////////////////////
    if (!username || !password || !firstName || !lastName || !nationalId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
    // VALIDATE PHONE (10 digits)
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
      const newAccount = await tx.account.create({
        data: {
          username,
          email: email || null,
          password: hashedPassword,
        },
      });

      const newMember = await tx.member.create({
        data: {
          nationalId,
          firstName,
          lastName,
          phone: phone || null,
          houseNo: houseNo || null,
          village: village || null,
          road: road || null,
          alley: alley || null,
          subDistrict: subDistrict || null,
          district: district || null,
          province: province || null,
          postalCode: postalCode || null,
          accountId: newAccount.id,
          wallet: {
            create: {},
          },
        },
        include: {
          account: {
            select: {
              username: true,
              email: true,
            },
          },
          wallet: true,
        },
      });

      return newMember;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("CREATE MEMBER ERROR:", error);

    //////////////////////////////////////////////////////
    // HANDLE PRISMA UNIQUE ERROR
    //////////////////////////////////////////////////////
    if (error.code === "P2002") {
      const target = error.meta?.target?.[0];

      if (target === "phone") {
        return NextResponse.json(
          { field: "phone", message: "เบอร์โทรศัพท์นี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }

      if (target === "nationalId") {
        return NextResponse.json(
          { field: "nationalId", message: "เลขบัตรประชาชนนี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }

      if (target === "username") {
        return NextResponse.json(
          { field: "username", message: "Username นี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }

      if (target === "email") {
        return NextResponse.json(
          { field: "email", message: "Email นี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างสมาชิก" },
      { status: 500 },
    );
  }
}
