import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();
export async function GET() {
  const waste = await prisma.wasteType.findMany();
  return NextResponse.json(waste);
}