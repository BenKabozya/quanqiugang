import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, imageUrl, videoUrl, mediaCaption, eventDate } =
  await req.json();
  const activity = await prisma.activity.update({
    where: { id },
    
    data: {
  title,
  description,
  imageUrl: imageUrl || null,
  videoUrl: videoUrl || null,
  mediaCaption: mediaCaption || null,
  eventDate: new Date(eventDate),
},
  });

  return NextResponse.json(activity);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      admin: { select: { name: true } },
      comments: {
        orderBy: [{ likes: "desc" }, { createdAt: "asc" }],
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(activity);
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

  await prisma.activity.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
