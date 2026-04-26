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
          include: { wallet: true },
        });
        if (!member) {
          return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        return NextResponse.json({
          balance: member.wallet?.balance || 0,
        });
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
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