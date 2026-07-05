import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  await prisma.notification.updateMany({
    where:
      role === "admin"
        ? { recipientType: "admin", read: false }
        : { recipientType: "user", recipientId: userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}