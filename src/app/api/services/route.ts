import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrl, videoUrl, mediaCaption } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      title,
      description,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      mediaCaption: mediaCaption || null,
      adminId: (session.user as any).id,
    },
  });

  return NextResponse.json(service, { status: 201 });
}