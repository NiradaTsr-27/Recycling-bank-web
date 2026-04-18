import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
// ==============================
// GET: ดึงหน่วยงานทั้งหมด
// ==============================
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("โหลดหน่วยงานไม่สำเร็จ:", error);
    return NextResponse.json(
      { message: "โหลดหน่วยงานไม่สำเร็จ" },
      { status: 500 },
    );
  }
}

// ==============================
// POST: เพิ่มหน่วยงานใหม่
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newOrganization = await prisma.organization.create({
      data: {
        name: body.name,
        houseNo: body.houseNo || null,
        village: body.village || null,
        road: body.road || null,
        alley: body.alley || null,
        subDistrict: body.subDistrict || null,
        district: body.district || null,
        province: body.province || null,
        postalCode: body.postalCode || null,
        phone: body.phone || null,
        mapUrl: body.mapUrl || null,
      },
    });

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("เพิ่มหน่วยงานไม่สำเร็จ:", error);
    return NextResponse.json(
      { message: "เพิ่มหน่วยงานไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
