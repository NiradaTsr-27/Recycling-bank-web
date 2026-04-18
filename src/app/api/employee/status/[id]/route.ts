import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";
export const dynamic = "force-dynamic";

//////////////////////////////////////////////////////
// GET : ดึงรายละเอียดรายการขาย
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();

    const id = Number(params.id);

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        member: true,
        wasteType: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: sale.id,
      member: `${sale.member.firstName} ${sale.member.lastName}`,
      date: sale.createdAt,
      total: sale.totalPrice,
      status: sale.status,
      items: [
        {
          name: sale.wasteType.name,
          weight: sale.quantity,
          price: sale.totalPrice,
        },
      ],
    });
  } catch (error: any) {
    console.error("GET STATUS BY ID ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

//////////////////////////////////////////////////////
// PATCH : เปลี่ยน status (🔥 FIX แล้ว)
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();

    const id = Number(params.id);
    const body = await req.json();

    const allowedStatus = [
      TransactionStatus.PENDING,
      TransactionStatus.APPROVED,
      TransactionStatus.REJECTED,
    ];

    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      // ✅ update status ก่อน
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          status: body.status,
          approvedBy: body.employeeId ?? null,
        },
      });

      //////////////////////////////////////////////////////
      // 🔥 FIX จริง: เช็ค transaction แทน status
      //////////////////////////////////////////////////////
      if (body.status === TransactionStatus.APPROVED) {
        // 🔥 กันซ้ำ (สำคัญมาก)
        const existingTx = await tx.transaction.findFirst({
          where: {
            memberId: sale.memberId,
            amount: sale.totalPrice,
            type: "DEPOSIT",
          },
        });

        if (!existingTx) {
          let wallet = await tx.wallet.findUnique({
            where: { memberId: sale.memberId },
          });

          // 🔥 เผื่อไม่มี wallet
          if (!wallet) {
            wallet = await tx.wallet.create({
              data: {
                memberId: sale.memberId,
                balance: 0,
              },
            });
          }

          // ✅ เพิ่มเงิน
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                increment: sale.totalPrice,
              },
            },
          });

          // ✅ สร้าง transaction
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              memberId: sale.memberId,
              type: "DEPOSIT",
              amount: sale.totalPrice,
              status: "APPROVED",
              approvedBy: body.employeeId,
            },
          });

          console.log("✅ เงินเข้า wallet แล้ว:", sale.totalPrice);
        } else {
          console.log("⚠️ มี transaction นี้แล้ว (กันซ้ำ)");
        }
      }

      return updatedSale;
    });

    return NextResponse.json({
      message: "Status updated",
      sale: result,
    });
  } catch (error: any) {
    console.error("PATCH STATUS BY ID ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Sale not found") {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
