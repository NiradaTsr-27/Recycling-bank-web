import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export async function GET() {

      try {

      try {
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        const [
          totalMembers,
          totalEmployees,
          totalWasteTypes,
          todaySales,
          latestMembers,
          latestSales,
          salesByMonthRaw,
          topMembersRaw,
          topSalesRaw,
        ] = await Promise.all([
          prisma.member.count(),
          prisma.employee.count(),
          prisma.wasteType.count(),
          prisma.sale.aggregate({
            _sum: { totalPrice: true },
            where: { status: "APPROVED", createdAt: { gte: startOfDay } },
          }),
          prisma.member.findMany({
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { firstName: true, lastName: true, createdAt: true },
          }),
          prisma.sale.findMany({
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { totalPrice: true, createdAt: true },
          }),
          prisma.sale.findMany({
            where: { status: "APPROVED" },
            select: { totalPrice: true, createdAt: true },
          }),
          prisma.sale.groupBy({
            by: ["memberId"],
            where: { status: "APPROVED" },
            _sum: { totalPrice: true },
            orderBy: { _sum: { totalPrice: "desc" } },
            take: 5,
          }),
          prisma.sale.findMany({
            where: { status: "APPROVED" },
            orderBy: { totalPrice: "desc" },
            take: 5,
            select: {
              totalPrice: true,
              wasteType: { select: { name: true } },
            },
          }),
        ]);
        // Activities
        const activities = [
          ...latestMembers.map((m) => ({
            type: "member",
            text: `สมาชิกใหม่: ${m.firstName} ${m.lastName}`,
            createdAt: m.createdAt,
          })),
          ...latestSales.map((s) => ({
            type: "sale",
            text: `รับซื้อขยะ: ${s.totalPrice.toLocaleString()} บาท`,
            createdAt: s.createdAt,
          })),
        ]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map(({ type, text }) => ({ type, text }));
        // Monthly Revenue
        const monthlyRevenue = Array(12).fill(0);
        salesByMonthRaw.forEach((sale) => {
          const monthIndex = sale.createdAt.getMonth();
          monthlyRevenue[monthIndex] += sale.totalPrice;
        });

        // Top Members
        const topMemberIds = topMembersRaw.map((group) => group.memberId);
        const topMemberRecords = await prisma.member.findMany({
          where: { id: { in: topMemberIds } },
          select: { id: true, firstName: true, lastName: true },
        });
        const topMemberMap = new Map(
          topMemberRecords.map((member) => [member.id, member]),
        );
        const topMembers = topMembersRaw.map((group) => {
          const member = topMemberMap.get(group.memberId);
          return {
            name: member
              ? `${member.firstName} ${member.lastName}`
              : `สมาชิก ${group.memberId}`,
            purchases: Number(group._sum.totalPrice ?? 0),
          };
        });

        // Notifications
        const notifications = [
          `สมาชิกใหม่วันนี้ ${latestMembers.length} คน`,
          `ยอดขายวันนี้ ${todaySales._sum.totalPrice?.toLocaleString() || 0} บาท`,
        ];
        const topSales = topSalesRaw.map((s) => ({
          item: s.wasteType.name,
          amount: s.totalPrice,
        }));
        return NextResponse.json({
          totalMembers,
          totalEmployees,
          totalWasteTypes,
          todayRevenue: todaySales._sum.totalPrice || 0,
          activities,
          monthlyRevenue,
          notifications,
          topMembers,
          topSales,
        });
      } catch (error) {
        console.error("Dashboard API Error:", error);
        const message =
          process.env.NODE_ENV !== "production"
            ? String(error)
            : "Internal Server Error";
        return NextResponse.json({ message }, { status: 500 });
      }
      } catch (err: any) {
        if (err && err.message === "Unauthorized") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("BUILD SAFE ERROR:", err);
        return NextResponse.json({ error: "Build safe" }, { status: 200 });
      }
}