import { prisma } from "@/lib/db";

export async function notifyUser(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  await prisma.notification.create({
    data: { recipientType: "user", recipientId: userId, type, title, body, link },
  });
}

export async function notifyAdmins(
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  await prisma.notification.create({
    data: { recipientType: "admin", recipientId: null, type, title, body, link },
  });
}