import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";


export async function GET() {

      try {

      try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "MEMBER") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const member = await prisma.member.findUnique({
          where: { accountId: Number(session.user.id) },
          include: {
            wallet: true,
            sales: {
              where: { status: "APPROVED" },
              include: {
                wasteType: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        if (!member) {
          return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        // Calculate Dashboard Stats
        const balance = member.wallet?.balance || 0;
        let totalEarned = 0;
        let totalWeight = 0;
        member.sales.forEach(sale => {
          totalEarned += sale.totalPrice;
          totalWeight += sale.quantity;
        });
        const totalSales = member.sales.length;
        // For recent transactions list, we can use the top 10 recent sales
        const recentSales = member.sales.slice(0, 10).map(sale => ({
          id: sale.id,
          wasteName: sale.wasteType.name,
          quantity: sale.quantity,
          unit: sale.wasteType.unit,
          totalPrice: sale.totalPrice,
          createdAt: sale.createdAt,
        }));
        // Fetch latest announcements
        const announcements = await prisma.announcement.findMany({
          where: { newsstatus: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          }
        });
        // Fetch top 6 waste prices
        const wastePrices = await prisma.wasteType.findMany({
          orderBy: { price: "desc" },
          take: 6,
          include: {
            category: true
          }
        });
        return NextResponse.json({
          stats: {
            balance,
            totalEarned,
            totalWeight,
            totalSales,
          },
          recentSales,
          announcements,
          wastePrices: wastePrices.map(w => ({
            id: w.id,
            name: w.name,
            price: w.price,
            unit: w.unit,
            category: w.category?.name || "ทั่วไป",
          }))
        });
      } catch (error) {
        console.error("Error fetching member dashboard data:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
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