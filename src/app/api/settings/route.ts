import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const data = await prisma.siteSettings.findUnique({
      where: { id: "main" }
    });
    return NextResponse.json(data ?? { id: "main" });
  } catch {
    return NextResponse.json({ id: "main" });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const res = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: body,
    create: { id: "main", ...body }
  });
  return NextResponse.json(res);
}