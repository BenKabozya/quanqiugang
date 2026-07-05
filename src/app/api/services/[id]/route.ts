import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      admin: { select: { name: true } },
      comments: {
        orderBy: [{ likes: "desc" }, { createdAt: "asc" }],
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, imageUrl, videoUrl, mediaCaption } = await req.json();

  const service = await prisma.service.update({
    where: { id },
    data: {
      title,
      description,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      mediaCaption: mediaCaption || null,
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ success: true });
}