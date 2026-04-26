export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ✅ POST: บันทึกการขายของบุคคลทั่วไป
export async function POST(req: Request) {

      try {

      try {
        const body = await req.json();
        const { nationalId, firstName, lastName, wasteTypeId, quantity } = body;
        // 🔥 หา WasteType
        const waste = await prisma.wasteType.findUnique({
          where: { id: Number(wasteTypeId) },
        });
        if (!waste) {
          return NextResponse.json({ error: "ไม่พบประเภทขยะ" }, { status: 404 });
        }
        const totalPrice = waste.price * quantity;
        // 🔥 หา PublicUser (ถ้ามีแล้วใช้ของเดิม)
        let user = await prisma.publicUser.findFirst({
          where: { nationalId },
        });
        if (!user) {
          user = await prisma.publicUser.create({
            data: {
              nationalId,
              firstName,
              lastName,
            },
          });
        }
        // 🔥 สร้างรายการขาย
        const sale = await prisma.publicSale.create({
          data: {
            publicUserId: user.id,
            wasteTypeId: waste.id,
            quantity,
            totalPrice,
          },
        });
        return NextResponse.json({
          message: "บันทึกสำเร็จ",
          sale,
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}