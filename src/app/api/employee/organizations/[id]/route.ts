import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// ==============================
// GET by ID
// ==============================
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();
    const id = Number(params.id);
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        employees: true, // เผื่ออยากดูว่ามีพนักงานกี่คน
      },
    });
    if (!organization) {
      return NextResponse.json({ error: "ไม่พบหน่วยงาน" }, { status: 404 });
    }
    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("GET ORGANIZATION BY ID ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "โหลดข้อมูลไม่สำเร็จ" },
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
    await requireEmployee();
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
  } catch (error: any) {
    console.error("PATCH ORGANIZATION ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "แก้ไขไม่สำเร็จ" }, { status: 500 });
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
    await requireEmployee();
    const id = Number(params.id);
    await prisma.organization.delete({
      where: { id },
    });
    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error: any) {
    console.error("DELETE ORGANIZATION ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "ลบไม่สำเร็จ (อาจมีพนักงานใช้งานอยู่)" },
      { status: 500 },
    );
  }
}