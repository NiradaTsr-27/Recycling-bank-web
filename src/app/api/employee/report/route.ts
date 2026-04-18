import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireEmployee();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "กรุณาระบุวันที่" }, { status: 400 });
    }

    // ✅ แปลง string → Date
    const selectedDate = new Date(dateParam);

    // 🔥 กำหนดช่วงเวลา (ทั้งวัน)
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    // ===== ดึงข้อมูล sale =====
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "APPROVED",
      },
      include: {
        wasteType: true,
      },
    });

    // ===== Summary =====
    const totalWeight = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalAmount = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalTransactions = sales.length;
    const uniqueMembers = new Set(sales.map((s) => s.memberId)).size;

    // ===== Group by wasteType =====
    const grouped: any = {};

    sales.forEach((sale) => {
      const key = sale.wasteType.name;

      if (!grouped[key]) {
        grouped[key] = {
          wasteType: sale.wasteType.name,
          totalWeight: 0,
          price: sale.wasteType.price,
          totalAmount: 0,
        };
      }

      grouped[key].totalWeight += sale.quantity;
      grouped[key].totalAmount += sale.totalPrice;
    });

    const wasteSummary = Object.values(grouped);

    return NextResponse.json({
      summary: {
        totalWeight,
        totalAmount,
        totalTransactions,
        uniqueMembers,
      },
      wasteSummary,
    });
  } catch (error: any) {
    console.error("GET REPORT ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
