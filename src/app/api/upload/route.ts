import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File too large. Max 20MB." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const safeName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${ext}`;
  const filePath = path.join(uploadDir, safeName);

  await writeFile(filePath, buffer);

  const mimeType = file.type;
let fileType = "file";
if (mimeType.startsWith("image/")) fileType = "image";
else if (mimeType.startsWith("video/")) fileType = "video";
else if (mimeType.startsWith("audio/")) fileType = "audio";

return NextResponse.json(
  { url: `/uploads/${safeName}`, fileType },
  { status: 201 }
);
}