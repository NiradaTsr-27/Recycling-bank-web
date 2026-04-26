import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ✅ กัน build พัง (สำคัญมาก)
const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};





//////////////////////////////////////////////////////
// GET BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {

      try {

      const adminAuth = await safeRequireAdmin();

      if (!adminAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }



      try {
    const waste = await prisma.wasteType.findUnique({
          where: { id: Number(params.id) },
        });
        if (!waste) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(waste);
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
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

      const adminAuth = await safeRequireAdmin();

      if (!adminAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }



      try {
    const body = await req.json();
        const { name, price, unit, categoryId } = body;
        const updated = await prisma.wasteType.update({
          where: { id: Number(params.id) },
          data: {
            name,
            price: price ? Number(price) : undefined,
            unit,
            categoryId: categoryId ? Number(categoryId) : undefined,
          },
        });
        return NextResponse.json(updated);
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
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

      const adminAuth = await safeRequireAdmin();

      if (!adminAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }



      try {
    await prisma.wasteType.delete({
          where: { id: Number(params.id) },
        });
        return NextResponse.json({ message: "Deleted" });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}