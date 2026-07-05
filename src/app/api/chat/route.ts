import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyUser, notifyAdmins } from "@/lib/notify";

// GET: user gets their own thread; admin gets a specific user's thread via ?userId=
export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const requestedUserId = searchParams.get("userId");

  let userId: string;

  if (role === "admin") {
    if (!requestedUserId) {
      return NextResponse.json(
        { error: "userId is required for admin requests." },
        { status: 400 }
      );
    }
    userId = requestedUserId;
  } else {
    userId = (session.user as any).id;
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      admin: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const { content, fileUrl, fileType, userId: targetUserId } =
    await req.json();

  if (!content && !fileUrl) {
    return NextResponse.json(
      { error: "Message must have text or a file." },
      { status: 400 }
    );
  }

  let userId: string;
  let adminId: string | null = null;
  let senderType: string;

  if (role === "admin") {
    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required when admin sends a message." },
        { status: 400 }
      );
    }
    userId = targetUserId;
    adminId = (session.user as any).id;
    senderType = "admin";
  } else {
    userId = (session.user as any).id;
    senderType = "user";
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: content || null,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      userId,
      adminId,
      senderType,
    },
  });

  if (senderType === "admin") {
    await notifyUser(
      userId,
      "message",
      "New message from our team",
      content || "Sent an attachment",
      "/chat"
    );
  } else {
    await notifyAdmins(
      "message",
      "New chat message",
      content || "Sent an attachment",
      "/admin/inbox"
    );
  }

  return NextResponse.json(message, { status: 201 });
}