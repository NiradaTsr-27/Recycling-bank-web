export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {

      try {

      try {
        await requireEmployee();
        const { isActive } = await req.json();
        const updated = await prisma.member.update({
          where: { id: Number(params.id) },
          data: { isActive },
        });
        return NextResponse.json(updated);
      } catch (error: any) {
        console.error("PATCH MEMBER STATUS ERROR:", error);
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