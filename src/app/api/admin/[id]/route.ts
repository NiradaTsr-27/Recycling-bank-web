import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import bcrypt from "bcryptjs";

//////////////////////////////////////////////////////
// GET ADMIN BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const admin = await prisma.admin.findUnique({
      where: { id: Number(params.id) },
      include: {
        account: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

//////////////////////////////////////////////////////
// UPDATE ADMIN
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { firstName, lastName, password } = body;

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    if (password) {
      const admin = await prisma.admin.findUnique({
        where: { id: Number(params.id) },
      });

      if (admin) {
        const hashed = await bcrypt.hash(password, 10);

        await prisma.account.update({
          where: { id: admin.accountId },
          data: { password: hashed },
        });
      }
    }

    const updated = await prisma.admin.update({
      where: { id: Number(params.id) },
      data: updateData,
      include: { account: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

//////////////////////////////////////////////////////
// DELETE ADMIN
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const admin = await prisma.admin.findUnique({
      where: { id: Number(params.id) },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // ลบ Admin ก่อน
    await prisma.admin.delete({
      where: { id: Number(params.id) },
    });

    // แล้วลบ Account
    await prisma.account.delete({
      where: { id: admin.accountId },
    });

    return NextResponse.json({
      message: "Admin deleted",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
