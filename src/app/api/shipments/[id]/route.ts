import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyUser } from "@/lib/notify";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, notes, origin, destination } = await req.json();

  const shipment = await prisma.shipment.update({
  where: { id },
  data: {
    status,
    notes: notes ?? undefined,
    origin: origin ?? undefined,
    destination: destination ?? undefined,
    updatedById: (session.user as any).id,
  },
});

await notifyUser(
  shipment.userId,
  "shipment",
  "Shipment status updated",
  `Now: ${status.replace("_", " ")}`,
  "/my-shipments"
);

  return NextResponse.json(shipment);
}