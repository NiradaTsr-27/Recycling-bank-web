import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
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
}
