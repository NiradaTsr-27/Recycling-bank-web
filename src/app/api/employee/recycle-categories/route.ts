import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    await requireEmployee();
    const categories = await prisma.recycleCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("GET RECYCLE CATEGORIES ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    await requireEmployee();
    const body = await req.json();
    const category = await prisma.recycleCategory.create({
      data: { name: body.name },
    });
    return NextResponse.json(category);
  } catch (error: any) {
    console.error("POST RECYCLE CATEGORIES ERROR:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}