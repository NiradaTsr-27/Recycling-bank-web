import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.recycleCategory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const category = await prisma.recycleCategory.create({
      data: { name: body.name },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
