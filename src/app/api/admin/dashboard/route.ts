import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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
      salesByMonth,
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
      prisma.$queryRaw<{ month: number; total: number }[]>`
        SELECT EXTRACT(MONTH FROM "createdAt") AS month,
               SUM("totalPrice") AS total
        FROM "Sale"
        WHERE status = 'APPROVED'
        GROUP BY month
      `,
      // Top Members
      prisma.$queryRaw<
        {
          memberId: number;
          firstName: string;
          lastName: string;
          totalPurchases: number;
        }[]
      >`
        SELECT m.id as "memberId", m."firstName", m."lastName", SUM(s."totalPrice") AS "totalPurchases"
        FROM "Member" m
        LEFT JOIN "Sale" s ON m.id = s."memberId" AND s.status = 'APPROVED'
        GROUP BY m.id
        ORDER BY "totalPurchases" DESC
        LIMIT 5
      `,
      // Top Sales
      prisma.sale.findMany({
        where: { status: "APPROVED" },
        orderBy: { totalPrice: "desc" },
        take: 5,
        select: {
          totalPrice: true,
          wasteType: { select: { name: true } }, // ✅ แก้ตรงนี้
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
    salesByMonth.forEach(
      (m) => (monthlyRevenue[m.month - 1] = Number(m.total)),
    );

    // Notifications
    const notifications = [
      `สมาชิกใหม่วันนี้ ${latestMembers.length} คน`,
      `ยอดขายวันนี้ ${todaySales._sum.totalPrice?.toLocaleString() || 0} บาท`,
    ];

    // Format Top Members / Top Sales
    const topMembers = topMembersRaw.map((m) => ({
      name: `${m.firstName} ${m.lastName}`,
      purchases: m.totalPurchases || 0,
    }));

    const topSales = topSalesRaw.map((s) => ({
      item: s.wasteType.name, // ✅ ใช้ชื่อ wasteType แทน item
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
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
