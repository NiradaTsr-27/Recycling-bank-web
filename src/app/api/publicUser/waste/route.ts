export const dynamic = "force-dynamic";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const waste = await prisma.wasteType.findMany();
  return NextResponse.json(waste);
}
