import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
export const dynamic = "force-dynamic";

//////////////////////////////////////////////////////
// GET BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const waste = await prisma.wasteType.findUnique({
      where: { id: Number(params.id) },
    });

    if (!waste) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(waste);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    await prisma.wasteType.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
