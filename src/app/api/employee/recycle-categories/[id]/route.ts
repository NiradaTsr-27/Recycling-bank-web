import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

//////////////////////////////////////////////////////
// GET BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();
    const category = await prisma.recycleCategory.findUnique({
      where: { id: Number(params.id) },
    });
    if (!category) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error: any) {
    console.error("GET RECYCLE CATEGORY BY ID ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
//////////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();
    const body = await req.json();
    const updated = await prisma.recycleCategory.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH RECYCLE CATEGORY ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
//////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();
    const id = Number(params.id);
    // 🔥 ป้องกันลบถ้ามี waste ใช้อยู่
    const used = await prisma.wasteType.findFirst({
      where: { categoryId: id },
    });
    if (used) {
      return NextResponse.json(
        { error: "ไม่สามารถลบได้ เนื่องจากมีประเภทขยะใช้งานอยู่" },
        { status: 400 },
      );
    }
    await prisma.recycleCategory.delete({
      where: { id },
    });
    return NextResponse.json({
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (error: any) {
    console.error("DELETE RECYCLE CATEGORY ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}