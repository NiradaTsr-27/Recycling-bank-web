import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export async function GET() {

      try {

      try {
        const sales = await prisma.publicSale.findMany({
          include: {
            publicUser: true,
            wasteType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return NextResponse.json(sales);
      } catch (error) {
        return NextResponse.json({ error: "โหลดข้อมูลไม่สำเร็จ" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}