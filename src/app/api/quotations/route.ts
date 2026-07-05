import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAdmins } from "@/lib/notify";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const quotations = await prisma.quotation.findMany({
    where: role === "admin" ? {} : { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, country: true } },
      respondedBy: { select: { name: true } },
    },
  });

  return NextResponse.json(quotations);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "user") {
    return NextResponse.json(
      { error: "You must be signed in as a user to request a quotation." },
      { status: 401 }
    );
  }

  const { productName, quantity, budget, details, attachmentUrl } =
    await req.json();

  if (!productName || !quantity || !details) {
    return NextResponse.json(
      { error: "Product name, quantity, and details are required." },
      { status: 400 }
    );
  }

  const quotation = await prisma.quotation.create({
    data: {
      productName,
      quantity,
      budget: budget || null,
      details,
      attachmentUrl: attachmentUrl || null,
      userId: (session.user as any).id,
    },
  });

  await notifyAdmins(
    "quotation",
    "New quotation request",
    `${productName} — qty ${quantity}`,
    "/admin/quotations"
  );

  return NextResponse.json(quotation, { status: 201 });
}