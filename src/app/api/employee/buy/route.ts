import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

//////////////////////////////////////////////////////
// GET -> โหลด option dropdown
//////////////////////////////////////////////////////
export async function GET() {
  try {
    await requireEmployee();

    const members = await prisma.member.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { firstName: "asc" },
    });

    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { firstName: "asc" },
    });

    // รายการขยะ
    const wastes = await prisma.wasteType.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        unit: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      members,
      employees,
      wastes,
    });
  } catch (error: any) {
    console.error("GET BUY ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load dropdown data" },
      { status: 500 },
    );
  }
}

//////////////////////////////////////////////////////
// POST -> บันทึกการรับซื้อขยะ
//////////////////////////////////////////////////////
export async function POST(req: Request) {
  try {
    await requireEmployee();

    const body = await req.json();

    const { memberId, employeeId, wasteTypeId, quantity } = body;

    if (!memberId || !employeeId || !wasteTypeId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const waste = await prisma.wasteType.findUnique({
      where: { id: Number(wasteTypeId) },
    });

    if (!waste) {
      return NextResponse.json(
        { error: "Waste type not found" },
        { status: 404 },
      );
    }

    const totalPrice = waste.price * Number(quantity);

    // 🔥 ใช้ transaction กันพัง
    const result = await prisma.$transaction(async (tx) => {
      // 1. สร้าง sale
      const sale = await tx.sale.create({
        data: {
          memberId: Number(memberId),
          wasteTypeId: Number(wasteTypeId),
          quantity: Number(quantity),
          totalPrice,
          status: body.status ?? "PENDING",
          approvedBy: body.status === "APPROVED" ? Number(employeeId) : null,
        },
      });

      // 2. ถ้า APPROVED → ใส่เงินทันที
      if (sale.status === "APPROVED") {
        let wallet = await tx.wallet.findUnique({
          where: { memberId: sale.memberId },
        });

        // 🔥 ไม่มี wallet → สร้าง
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              memberId: sale.memberId,
              balance: 0,
            },
          });
        }

        // 🔥 เพิ่มเงิน
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: sale.totalPrice,
            },
          },
        });

        // 🔥 บันทึก transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            memberId: sale.memberId,
            type: "DEPOSIT",
            amount: sale.totalPrice,
            status: "APPROVED",
            approvedBy: Number(employeeId),
          },
        });
      }

      return sale;
    });

    return NextResponse.json({
      message: "Sale created",
      sale: result,
    });
  } catch (error: any) {
    console.error("POST BUY ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
