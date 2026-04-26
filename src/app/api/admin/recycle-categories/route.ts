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





export async function GET() {

      try {

      const adminAuth = await safeRequireAdmin();

      if (!adminAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }



      try {
    const categories = await prisma.recycleCategory.findMany({
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(categories);
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
export async function POST(req: Request) {

      try {

      const adminAuth = await safeRequireAdmin();

      if (!adminAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }



      try {
    const body = await req.json();
        const category = await prisma.recycleCategory.create({
          data: { name: body.name },
        });
        return NextResponse.json(category);
      } catch {
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}