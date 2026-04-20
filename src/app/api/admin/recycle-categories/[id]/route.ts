import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";

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
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  try {
const category = await prisma.recycleCategory.findUnique({
      where: { id: Number(params.id) },
    });
    if (!category) {
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  try {
const body = await req.json();
    const updated = await prisma.recycleCategory.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
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
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  try {
const id = Number(params.id);
    // 🔥 ป้องกันลบถ้ามี waste ใช้อยู่
    const used = await prisma.wasteType.findFirst({
      where: { categoryId: id },
    });
    if (used) {
      return NextResponse.json(
        { message: "ไม่สามารถลบได้ เนื่องจากมีประเภทขยะใช้งานอยู่" },
        { status: 400 },
      );
    }
    await prisma.recycleCategory.delete({
      where: { id },
    });
    return NextResponse.json({
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}