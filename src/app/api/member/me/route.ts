import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { accountId: Number(session.user.id) },
      include: { account: true },
    });

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || "",
      nationalId: member.nationalId,
      houseNo: member.houseNo || "",
      village: member.village || "",
      alley: member.alley || "",
      road: member.road || "",
      subDistrict: member.subDistrict || "",
      district: member.district || "",
      province: member.province || "",
      postalCode: member.postalCode || "",
      username: member.account.username,
      email: member.account.email,
    });
  } catch (error) {
    console.error("GET /api/member/me error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      firstName, lastName, phone, 
      houseNo, village, alley, road, 
      subDistrict, district, province, postalCode 
    } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, นามสกุล, เบอร์โทร)" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { accountId: Number(session.user.id) },
      data: {
        firstName,
        lastName,
        phone,
        houseNo,
        village,
        alley,
        road,
        subDistrict,
        district,
        province,
        postalCode
      },
    });

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ", member: updatedMember });
  } catch (error) {
    console.error("PUT /api/member/me error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}
