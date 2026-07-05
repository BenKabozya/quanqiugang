import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { notifyAdmins } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const { name, email, phone, country, password } = await req.json();

    if (!name || !email || !phone || !country || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
  data: { name, email, phone, country, password: hashedPassword },
});

await notifyAdmins(
  "registration",
  "New user registered",
  `${user.name} from ${user.country} just signed up.`,
  "/admin/users"
);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}