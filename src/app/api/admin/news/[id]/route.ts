import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

//////////////////////////////////////////////////////
// GET by ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {

      try {

      try {
        const id = Number(params.id);
        const announcement = await prisma.announcement.findUnique({
          where: { id },
        });
        if (!announcement) {
          return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
        }
        return NextResponse.json(announcement);
      } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
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
// PATCH
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {

      try {

      try {
        const id = Number(params.id);
        const body = await req.json();
        const { title, content, newsstatus } = body;
        const updated = await prisma.announcement.update({
          where: { id },
          data: {
            title,
            content,
            newsstatus,
          },
        });
        return NextResponse.json(updated);
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { message: "ไม่สามารถแก้ไขข้อมูลได้" },
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
//////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {

      try {

      try {
        const id = Number(params.id);
        await prisma.announcement.delete({
          where: { id },
        });
        return NextResponse.json({ message: "ลบสำเร็จ" });
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { message: "ไม่สามารถลบข้อมูลได้" },
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