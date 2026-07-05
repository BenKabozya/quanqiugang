import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "user") {
    return NextResponse.json(
      { error: "You must be signed in as a user to comment." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  const comment = await prisma.serviceComment.create({
    data: {
      content,
      serviceId: id,
      userId: (session.user as any).id,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}