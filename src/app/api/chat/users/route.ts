import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { chatMessages: { some: {} } },
    select: {
      id: true,
      name: true,
      email: true,
      country: true,
      chatMessages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderType: true },
      },
    },
  });

  const sorted = users.sort((a, b) => {
    const aTime = a.chatMessages[0]?.createdAt || 0;
    const bTime = b.chatMessages[0]?.createdAt || 0;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return NextResponse.json(sorted);
}