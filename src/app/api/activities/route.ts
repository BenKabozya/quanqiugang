import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { eventDate: "desc" },
    include: {
      admin: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
      _count: { select: { comments: true } },
    },
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, imageUrl, videoUrl, mediaCaption, eventDate } = body;

  if (!title || !description || !eventDate) {
    return NextResponse.json(
      { error: "Title, description, and date are required." },
      { status: 400 }
    );
  }

  const activity = await prisma.activity.create({
    data: {
      title,
      description,
      imageUrl: imageUrl ?? null,
      videoUrl: videoUrl ?? null,
      mediaCaption: mediaCaption ?? null,
      eventDate: new Date(eventDate),
      adminId: (session.user as any).id,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
