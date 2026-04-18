import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const { isActive } = await req.json();

    const updated = await prisma.member.update({
      where: { id: Number(params.id) },
      data: { isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Update status failed" },
      { status: 500 },
    );
  }
}
