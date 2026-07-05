import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      { error: "File too large. Max 200MB." },
      { status: 400 }
    );
  }

  const mimeType = file.type;
  let fileType = "file";
  if (mimeType.startsWith("image/")) fileType = "image";
  else if (mimeType.startsWith("video/")) fileType = "video";
  else if (mimeType.startsWith("audio/")) fileType = "audio";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  try {
    const resourceType =
      fileType === "video" || fileType === "audio" ? "video" : fileType === "image" ? "image" : "raw";

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "quanqiugang",
      resource_type: resourceType,
    });

    return NextResponse.json(
      { url: result.secure_url, fileType },
      { status: 201 }
    );
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}