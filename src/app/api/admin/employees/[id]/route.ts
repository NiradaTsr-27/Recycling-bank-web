import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authAdmin";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

//////////////////////////////////////////////////////
// GET EMPLOYEE BY ID
//////////////////////////////////////////////////////
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const employee = await prisma.employee.findUnique({
      where: { id: Number(params.id) },
      include: {
        account: true,
        organization: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

//////////////////////////////////////////////////////
// UPDATE EMPLOYEE
//////////////////////////////////////////////////////
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      username,
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
      organizationId,
    } = body;

    const employee = await prisma.employee.findUnique({
      where: { id: Number(params.id) },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // -------------------------------
    // validate email
    // -------------------------------
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // -------------------------------
    // check duplicate username
    // -------------------------------
    if (username) {
      const existingUsername = await prisma.account.findFirst({
        where: {
          username,
          NOT: { id: employee.accountId },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 },
        );
      }
    }

    // -------------------------------
    // check duplicate email
    // -------------------------------
    if (email) {
      const existingEmail = await prisma.account.findFirst({
        where: {
          email,
          NOT: { id: employee.accountId },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // -------------------------------
    // check duplicate phone
    // -------------------------------
    if (phone) {
      const existingPhone = await prisma.employee.findFirst({
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

    // -------------------------------
    // check duplicate nationalId
    // -------------------------------
    if (nationalId) {
      const existingNationalId = await prisma.employee.findFirst({
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

    // -------------------------------
    // TRANSACTION UPDATE
    // -------------------------------
    await prisma.$transaction(async (tx) => {
      //  update employee
      await tx.employee.update({
        where: { id: Number(params.id) },
        data: {
          firstName,
          lastName,
          phone,
          nationalId,
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

          organizationId:
            organizationId && organizationId !== ""
              ? Number(organizationId)
              : null,
        },
      });

      // update account
      const accountUpdate: any = {};

      if (username) accountUpdate.username = username;
      if (email) accountUpdate.email = email;
      if (password) {
        accountUpdate.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(accountUpdate).length > 0) {
        await tx.account.update({
          where: { id: employee.accountId },
          data: accountUpdate,
        });
      }
    });

    const updated = await prisma.employee.findUnique({
      where: { id: Number(params.id) },
      include: {
        account: true,
        organization: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
//////////////////////////////////////////////////////
// DELETE EMPLOYEE
//////////////////////////////////////////////////////
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const employee = await prisma.employee.findUnique({
      where: { id: Number(params.id) },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // atomic delete
    await prisma.$transaction([
      prisma.employee.delete({
        where: { id: Number(params.id) },
      }),
      prisma.account.delete({
        where: { id: employee.accountId },
      }),
    ]);

    return NextResponse.json({ message: "Employee deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
