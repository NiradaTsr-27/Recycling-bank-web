import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

//////////////////////////////////////////////////////
// GET DASHBOARD STATS
//////////////////////////////////////////////////////
export async function GET() {

      try {

      try {
        await requireEmployee();
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        const [
          totalMembers,
          todaySales,
          todayRevenue,
          pendingPurchases,
          categories,
          todayPublicSales,
          todayPublicRevenue,
        ] = await Promise.all([
          prisma.member.count(),
          prisma.sale.findMany({
            where: {
              createdAt: { gte: startOfDay },
            },
            include: {
              wasteType: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  categoryId: true,
                },
              },
            },
            orderBy: { id: "asc" },
          }),
          prisma.sale.aggregate({
            _sum: { totalPrice: true },
            where: {
              status: TransactionStatus.APPROVED,
              createdAt: { gte: startOfDay },
            },
          }),
          prisma.sale.count({
            where: {
              status: TransactionStatus.PENDING,
            },
          }),
          prisma.recycleCategory.findMany({
            select: { id: true, name: true },
            orderBy: { id: "asc" },
          }),
          prisma.publicSale.findMany({
            where: {
              createdAt: { gte: startOfDay },
            },
            include: {
              wasteType: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  categoryId: true,
                },
              },
            },
          }),
          prisma.publicSale.aggregate({
            _sum: { totalPrice: true },
            where: {
              createdAt: { gte: startOfDay },
            },
          }),
        ]);
        const totalTransactions = todaySales.length + todayPublicSales.length;
        const totalRevenue =
          (todayRevenue._sum?.totalPrice ?? 0) +
          (todayPublicRevenue._sum?.totalPrice ?? 0);
        const wasteList = todaySales.map((sale) => ({
          id: sale.id,
          name: sale.wasteType.name,
          price: sale.wasteType.price,
          categoryId: sale.wasteType.categoryId,
          createdAt: sale.createdAt.toISOString(),
          source: "MEMBER",
        }));
        const publicWasteList = todayPublicSales.map((sale) => ({
          id: sale.id,
          name: sale.wasteType.name,
          price: sale.wasteType.price,
          categoryId: sale.wasteType.categoryId,
          createdAt: sale.createdAt.toISOString(),
          source: "PUBLIC",
        }));
        const mergedWasteList = [...wasteList, ...publicWasteList];
        return NextResponse.json({
          stats: {
            totalMembers,
            todayTransactions: totalTransactions,
            todayRevenue: totalRevenue,
            pendingBuy: pendingPurchases,
          },
          categories,
          wasteList: mergedWasteList,
        });
      } catch (error: any) {
        console.error("GET DASHBOARD ERROR:", error);
        if (error.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
          { error: "Internal Server Error" },
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