export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { accountId: Number(session.user.id) },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Fetch all sales for this member
    const sales = await prisma.sale.findMany({
      where: { memberId: member.id },
      include: {
        wasteType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      sales.map(s => ({
        id: s.id,
        wasteName: s.wasteType.name,
        quantity: s.quantity,
        unit: s.wasteType.unit,
        totalPrice: s.totalPrice,
        status: s.status,
        createdAt: s.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching member history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
