import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// ✅ กัน build พัง (สำคัญมาก)
const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};


//////////////////////////////////////////////////////
// GET ALL WASTE TYPES
//////////////////////////////////////////////////////
export async function GET() {
  const adminAuth = await safeRequireAdmin();

  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
const wastes = await prisma.wasteType.findMany({
      include: {
        category: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(wastes);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
//////////////////////////////////////////////////////
// CREATE WASTE TYPE
//////////////////////////////////////////////////////
export async function POST(req: Request) {
  const adminAuth = await safeRequireAdmin();

  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
const body = await req.json();
    const { name, price, unit, categoryId } = body;
    //////////////////////////////////////////////////////
    // VALIDATE
    //////////////////////////////////////////////////////
    if (!name || price === undefined || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    if (!categoryId) {
      return NextResponse.json(
        { error: "กรุณาเลือกประเภทขยะ" },
        { status: 400 },
      );
    }
    //////////////////////////////////////////////////////
    // CHECK CATEGORY EXISTS (กัน FK ERROR 🔥)
    //////////////////////////////////////////////////////
    const category = await prisma.recycleCategory.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!category) {
      return NextResponse.json(
        { error: "ไม่พบประเภทขยะนี้ในระบบ" },
        { status: 400 },
      );
    }
    //////////////////////////////////////////////////////
    // CREATE
    //////////////////////////////////////////////////////
    const newWaste = await prisma.wasteType.create({
      data: {
        name,
        price: Number(price),
        unit,
        categoryId: Number(categoryId),
      },
    });
    return NextResponse.json(newWaste);
  } catch (error: any) {
    console.error("CREATE ERROR:", error);
    return NextResponse.json(
      {
        error: "Create failed",
        detail: error.message,
      },
      { status: 500 },
    );
  }
}