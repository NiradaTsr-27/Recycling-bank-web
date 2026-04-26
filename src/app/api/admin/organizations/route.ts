import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ==============================
// GET: ดึงหน่วยงานทั้งหมด
// ==============================
export async function GET() {

      try {

      try {
        const organizations = await prisma.organization.findMany({
          orderBy: { id: "asc" },
        });
        return NextResponse.json(organizations);
      } catch (error) {
        console.error("โหลดหน่วยงานไม่สำเร็จ:", error);
        return NextResponse.json(
          { message: "โหลดหน่วยงานไม่สำเร็จ" },
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
// ==============================
// POST: เพิ่มหน่วยงานใหม่
// ==============================
export async function POST(req: Request) {

      try {

      try {
        const body = await req.json();
        const newOrganization = await prisma.organization.create({
          data: {
            name: body.name,
            houseNo: body.houseNo || null,
            village: body.village || null,
            road: body.road || null,
            alley: body.alley || null,
            subDistrict: body.subDistrict || null,
            district: body.district || null,
            province: body.province || null,
            postalCode: body.postalCode || null,
            phone: body.phone || null,
            mapUrl: body.mapUrl || null,
          },
        });
        return NextResponse.json(newOrganization, { status: 201 });
      } catch (error) {
        console.error("เพิ่มหน่วยงานไม่สำเร็จ:", error);
        return NextResponse.json(
          { message: "เพิ่มหน่วยงานไม่สำเร็จ" },
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