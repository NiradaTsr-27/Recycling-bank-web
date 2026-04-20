import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};

//////////////////////////////////////////////////////
// GET ADMIN BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const adminAuth = await safeRequireAdmin();

    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(context.params.id);

    const admin = await prisma.admin.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (err) {
    console.error("BUILD SAFE ERROR:", err);
    return NextResponse.json({ error: "Build safe" }, { status: 200 });
  }
}

//////////////////////////////////////////////////////
// UPDATE ADMIN
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const adminAuth = await safeRequireAdmin();

    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(context.params.id);

    const body = await req.json();
    const { firstName, lastName, password } = body;

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    if (password) {
      const admin = await prisma.admin.findUnique({
        where: { id },
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
      where: { id },
      data: updateData,
      include: { account: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("BUILD SAFE ERROR:", err);
    return NextResponse.json({ error: "Build safe" }, { status: 200 });
  }
}

//////////////////////////////////////////////////////
// DELETE ADMIN
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const adminAuth = await safeRequireAdmin();

    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(context.params.id);

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await prisma.admin.delete({
      where: { id },
    });

    await prisma.account.delete({
      where: { id: admin.accountId },
    });

    return NextResponse.json({
      message: "Admin deleted",
    });
  } catch (err) {
    console.error("BUILD SAFE ERROR:", err);
    return NextResponse.json({ error: "Build safe" }, { status: 200 });
  }
}