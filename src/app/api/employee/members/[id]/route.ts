export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";
import bcrypt from "bcryptjs";

//////////////////////////////////////////////////////
// GET MEMBER BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();

    const member = await prisma.member.findUnique({
      where: { id: Number(params.id) },
      include: {
        account: { select: { username: true } },
        wallet: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("GET MEMBER BY ID ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//////////////////////////////////////////////////////
// UPDATE MEMBER
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// UPDATE MEMBER
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();

    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      nationalId,
      phone,
      houseNo,
      village,
      road,
      alley,
      subDistrict,
      district,
      province,
      postalCode,
    } = body;

    const member = await prisma.member.findUnique({
      where: { id: Number(params.id) },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    //////////////////////////////////////////////////////
    // VALIDATE EMAIL FORMAT
    //////////////////////////////////////////////////////
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    //////////////////////////////////////////////////////
    // CHECK DUPLICATE EMAIL
    //////////////////////////////////////////////////////
    if (email) {
      const existingEmail = await prisma.account.findFirst({
        where: {
          email,
          NOT: { id: member.accountId },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { field: "email", message: "Email นี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }
    }

    //////////////////////////////////////////////////////
    // CHECK DUPLICATE PHONE
    //////////////////////////////////////////////////////
    if (phone) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone,
          NOT: { id: Number(params.id) },
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { field: "phone", message: "เบอร์โทรศัพท์นี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }
    }

    //////////////////////////////////////////////////////
    // CHECK DUPLICATE NATIONAL ID
    //////////////////////////////////////////////////////
    if (nationalId) {
      const existingNationalId = await prisma.member.findFirst({
        where: {
          nationalId,
          NOT: { id: Number(params.id) },
        },
      });

      if (existingNationalId) {
        return NextResponse.json(
          { field: "nationalId", message: "เลขบัตรประชาชนนี้ถูกใช้แล้ว" },
          { status: 400 },
        );
      }
    }

    //////////////////////////////////////////////////////
    // TRANSACTION UPDATE
    //////////////////////////////////////////////////////
    await prisma.$transaction(async (tx) => {
      // update member
      await tx.member.update({
        where: { id: Number(params.id) },
        data: {
          firstName,
          lastName,
          nationalId,
          phone,
          houseNo,
          village,
          road,
          alley,
          subDistrict,
          district,
          province,
          postalCode:
            postalCode !== undefined && postalCode !== null && postalCode !== ""
              ? String(postalCode)
              : null,
        },
      });

      // update account
      const accountUpdate: any = {};

      if (email) accountUpdate.email = email;
      if (password) {
        accountUpdate.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(accountUpdate).length > 0) {
        await tx.account.update({
          where: { id: member.accountId },
          data: accountUpdate,
        });
      }
    });

    //////////////////////////////////////////////////////
    // RETURN UPDATED DATA
    //////////////////////////////////////////////////////
    const updated = await prisma.member.findUnique({
      where: { id: Number(params.id) },
      include: {
        account: true,
        wallet: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("UPDATE MEMBER ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//////////////////////////////////////////////////////
// DELETE MEMBER
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireEmployee();

    const member = await prisma.member.findUnique({
      where: { id: Number(params.id) },
    });

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.wallet.deleteMany({
      where: { memberId: member.id },
    });

    await prisma.member.delete({
      where: { id: member.id },
    });

    await prisma.account.delete({
      where: { id: member.accountId },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    console.error("DELETE MEMBER ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
