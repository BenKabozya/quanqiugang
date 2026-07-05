import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyUser } from "@/lib/notify";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;

  const shipments = await prisma.shipment.findMany({
    where: role === "admin" ? {} : { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, country: true } },
      updatedBy: { select: { name: true } },
    },
  });

  return NextResponse.json(shipments);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, trackingCode, origin, destination, notes } =
    await req.json();

  if (!userId || !trackingCode) {
    return NextResponse.json(
      { error: "User and tracking code are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.shipment.findUnique({
    where: { trackingCode },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A shipment with this tracking code already exists." },
      { status: 400 }
    );
  }

  const shipment = await prisma.shipment.create({
  data: {
    userId,
    trackingCode,
    origin: origin || null,
    destination: destination || null,
    notes: notes || null,
    updatedById: (session.user as any).id,
  },
});

await notifyUser(
  userId,
  "shipment",
  "Shipment created",
  `Tracking code ${trackingCode}`,
  "/my-shipments"
);

  return NextResponse.json(shipment, { status: 201 });
}