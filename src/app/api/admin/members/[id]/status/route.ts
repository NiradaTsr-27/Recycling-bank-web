import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
// ✅ กัน build พัง (สำคัญมาก)
const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};





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
    const { isActive } = await req.json();
        const updated = await prisma.member.update({
          where: { id: Number(params.id) },
          data: { isActive },
        });
        return NextResponse.json(updated);
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Update status failed" },
          { status: 500 },
        );
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}