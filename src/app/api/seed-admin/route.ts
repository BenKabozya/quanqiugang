import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = "clarazhu789@gmail.com";
  const password = "Admin123!";
  const name = "Clara Zhu";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Admin already exists.", email });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashedPassword },
  });

  return NextResponse.json({ message: "Admin created.", email: admin.email });
}