import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// ✅ กัน build พัง (สำคัญมาก)
const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};





//////////////////////////////////////////////////////
// GET: ดึงประกาศทั้งหมด
//////////////////////////////////////////////////////
export async function GET() {
  const adminAuth = await safeRequireAdmin();

  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }



  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 },
    );
  }
}
//////////////////////////////////////////////////////
// POST: เพิ่มประกาศ
//////////////////////////////////////////////////////
export async function POST(req: Request) {
  const adminAuth = await safeRequireAdmin();

  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }



  try {
const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, content, newsstatus } = body;
    if (!title || !content) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 },
      );
    }
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        newsstatus: newsstatus || "PUBLISHED",
        createdBy: Number(session.user.id), // 🔥 สำคัญมาก
      },
    });
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    console.error("Create announcement error:", error);
    return NextResponse.json(
      { message: error.message || "ไม่สามารถเพิ่มข้อมูลได้" },
      { status: 500 },
    );
  }
}