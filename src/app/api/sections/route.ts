import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const sections = await prisma.pageSection.findMany();
  return NextResponse.json(sections);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, title, body, imageUrl, videoUrl } = await req.json();

  if (!key || !title || !body) {
    return NextResponse.json(
      { error: "Key, title, and body are required." },
      { status: 400 }
    );
  }

  const section = await prisma.pageSection.upsert({
    where: { key },
    update: { title, body, imageUrl: imageUrl || null, videoUrl: videoUrl || null },
    create: { key, title, body, imageUrl: imageUrl || null, videoUrl: videoUrl || null },
  });

  return NextResponse.json(section);
}