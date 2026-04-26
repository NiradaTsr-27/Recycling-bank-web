import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

//////////////////////////////////////////////////////////
// GET (ดึงข้อมูลทั้งหมด)
//////////////////////////////////////////////////////////
export async function GET(req: NextRequest) {

      try {

      try {
        await requireEmployee();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const memberId = Number(searchParams.get("memberId"));
        const requestId = Number(searchParams.get("requestId"));
        switch (type) {
          // ================= สมาชิก + ยอดเงิน + ยอดขาย =================
          case "members": {
            const members = await prisma.member.findMany({
              include: {
                wallet: true,
                transactions: true,
              },
            });
            const result = members.map((m) => {
              const totalSale = m.transactions
                .filter((t) => t.type === "DEPOSIT")
                .reduce((sum, t) => sum + t.amount, 0);
              return {
                id: m.id,
                name: `${m.firstName} ${m.lastName}`,
                balance: m.wallet?.balance || 0,
                totalSale,
              };
            });
            return NextResponse.json(result);
          }
          // ================= ประวัติธุรกรรม =================
          case "history": {
            if (!memberId) {
              return NextResponse.json(
                { error: "Missing memberId" },
                { status: 400 },
              );
            }
            const transactions = await prisma.transaction.findMany({
              where: {
                memberId,
                status: "APPROVED",
              },
              orderBy: { createdAt: "desc" },
            });
            const result = transactions.map((t) => ({
              type: t.type === "DEPOSIT" ? "deposit" : "withdraw",
              amount: t.amount,
              date: t.createdAt,
            }));
            return NextResponse.json(result);
          }
          // ================= รายการถอนเงิน =================
          case "withdrawRequests": {
            const requests = await prisma.transaction.findMany({
              where: { type: "WITHDRAW" },
              include: { member: true },
              orderBy: { createdAt: "desc" },
            });
            const result = requests.map((r) => ({
              id: r.id,
              name: `${r.member.firstName} ${r.member.lastName}`,
              amount: r.amount,
              date: r.createdAt,
              status: r.status,
            }));
            return NextResponse.json(result);
          }
          // ================= รายละเอียดคำขอถอน =================
          case "withdrawDetail": {
            if (!requestId) {
              return NextResponse.json(
                { error: "Missing requestId" },
                { status: 400 },
              );
            }
            const request = await prisma.transaction.findUnique({
              where: { id: requestId },
              include: { member: true },
            });
            if (!request) {
              return NextResponse.json({ error: "Not found" }, { status: 404 });
            }
            return NextResponse.json({
              id: request.id,
              name: `${request.member.firstName} ${request.member.lastName}`,
              amount: request.amount,
              date: request.createdAt,
              status: request.status,
            });
          }
          default:
            return NextResponse.json(
              { error: "Invalid type parameter" },
              { status: 400 },
            );
        }
      } catch (error: any) {
        console.error("GET WALLET ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          { error: "Internal server error" },
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
//////////////////////////////////////////////////////////
// POST (ฝากเงิน / ขอถอน)
//////////////////////////////////////////////////////////
export async function POST(req: NextRequest) {

      try {

      try {
        await requireEmployee();
        const body = await req.json();
        const { action, memberId, amount } = body;
        if (!memberId || !amount) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 },
          );
        }
        const wallet = await prisma.wallet.findUnique({
          where: { memberId },
        });
        if (!wallet) {
          return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }
        switch (action) {
          // ================= ฝากเงิน =================
          case "deposit": {
            await prisma.$transaction(async (tx) => {
              await tx.wallet.update({
                where: { memberId },
                data: { balance: { increment: amount } },
              });
              await tx.transaction.create({
                data: {
                  walletId: wallet.id,
                  memberId,
                  type: "DEPOSIT",
                  amount,
                  status: "APPROVED",
                },
              });
            });
            return NextResponse.json({ message: "Deposit success" });
          }
          // ================= ขอถอนเงิน =================
          case "withdrawRequest": {
            await prisma.transaction.create({
              data: {
                walletId: wallet.id,
                memberId,
                type: "WITHDRAW",
                amount,
                status: "PENDING",
              },
            });
            return NextResponse.json({ message: "Withdraw request sent" });
          }
          default:
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
      } catch (error: any) {
        console.error("POST WALLET ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          { error: "Internal server error" },
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
//////////////////////////////////////////////////////////
// PATCH (approve / reject ถอนเงิน)
//////////////////////////////////////////////////////////
export async function PATCH(req: NextRequest) {

      try {

      try {
        await requireEmployee();
        const body = await req.json();
        const { requestId, status, employeeId } = body;
        if (!requestId || !status || !employeeId) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 },
          );
        }
        await prisma.$transaction(async (tx) => {
          const transaction = await tx.transaction.findUnique({
            where: { id: requestId },
          });
          if (!transaction) {
            throw new Error("Transaction not found");
          }
          // กันหักเงินซ้ำ
          const shouldDeduct =
            status === "APPROVED" && transaction.status !== "APPROVED";
          // update status
          await tx.transaction.update({
            where: { id: requestId },
            data: {
              status,
              approvedBy: employeeId,
            },
          });
          // หักเงินจริง
          if (shouldDeduct) {
            await tx.wallet.update({
              where: { id: transaction.walletId },
              data: {
                balance: { decrement: transaction.amount },
              },
            });
          }
        });
        return NextResponse.json({ message: "Updated successfully" });
      } catch (error: any) {
        console.error("PATCH WALLET ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          { error: "Update failed due to server error" },
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