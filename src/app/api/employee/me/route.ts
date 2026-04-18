import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/authEmployee";
export const dynamic = "force-dynamic";

//////////////////////////////////////////////////////
// GET EMPLOYEE ME
//////////////////////////////////////////////////////
export async function GET() {
  try {
    const session = await requireEmployee();

    const account = await prisma.account.findUnique({
      where: { id: Number(session.user.id) },
      include: {
        employee: true,
      },
    });

    if (!account || !account.employee) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลเจ้าหน้าที่" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      firstName: account.employee.firstName,
      lastName: account.employee.lastName,
      username: account.username,
      email: account.email,
    });
  } catch (error: any) {
    console.error("GET EMPLOYEE ME ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
