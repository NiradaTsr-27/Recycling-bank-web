import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
// ==============================
// GET by ID
// ==============================
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        employees: true, // เผื่ออยากดูว่ามีพนักงานกี่คน
      },
    });

    if (!organization) {
      return NextResponse.json({ message: "ไม่พบหน่วยงาน" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "โหลดข้อมูลไม่สำเร็จ" },
      { status: 500 },
    );
  }
}

// ==============================
// PATCH
// ==============================
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const updated = await prisma.organization.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "แก้ไขไม่สำเร็จ" }, { status: 500 });
  }
}

// ==============================
// DELETE
// ==============================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);

    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "ลบไม่สำเร็จ (อาจมีพนักงานใช้งานอยู่)" },
      { status: 500 },
    );
  }
}
