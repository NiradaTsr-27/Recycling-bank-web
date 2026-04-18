export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

//////////////////////////////////////////////////////
// GET : ดึงรายการขายทั้งหมด
//////////////////////////////////////////////////////
export async function GET() {
  try {
    await requireEmployee();

    const sales = await prisma.sale.findMany({
      include: {
        member: true,
        wasteType: true, // ตรวจสอบว่า relation ชื่อถูกต้อง
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = sales.map((sale) => ({
      id: sale.id,
      member: sale.member
        ? `${sale.member.firstName} ${sale.member.lastName}`
        : "-",
      date: sale.createdAt,
      items: sale.wasteType
        ? [
            `${sale.wasteType.name} (${sale.quantity} ${sale.wasteType.unit}) = ${Number(
              sale.totalPrice,
            ).toFixed(2)} บาท`,
          ]
        : [],
      total: sale.totalPrice || 0,
      status: sale.status || "PENDING",
      employee: sale.employee
        ? `${sale.employee.firstName} ${sale.employee.lastName}`
        : "-",
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET STATUS ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 },
    );
  }
}
