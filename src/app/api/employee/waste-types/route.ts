import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

//////////////////////////////////////////////////////
// GET ALL WASTE TYPES
//////////////////////////////////////////////////////
export async function GET() {

      try {

      try {
        await requireEmployee();
        const wastes = await prisma.wasteType.findMany({
          include: {
            category: true,
          },
          orderBy: { id: "asc" },
        });
        return NextResponse.json(wastes);
      } catch (error: any) {
        console.error("GET WASTE TYPES ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
// CREATE WASTE TYPE
//////////////////////////////////////////////////////
export async function POST(req: Request) {

      try {

      try {
        await requireEmployee();
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
        console.error("POST WASTE TYPE ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          {
            error: "Create failed",
            detail: error.message,
          },
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