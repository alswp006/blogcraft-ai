import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById } from "@/lib/models/post";
import { addPhotoWithNextSortOrder } from "@/lib/models/photo";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  const userId = token ? getSessionUserId(token) : null;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = getPostById(postId);
  if (!post || post.userId !== String(userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const memo = (formData.get("memo") as string) ?? "";

  if (!file) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  // Save file
  const uploadDir = path.join(process.cwd(), "public", "uploads", String(userId), postId);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const storedFilePath = `/uploads/${userId}/${postId}/${fileName}`;

  const photo = addPhotoWithNextSortOrder(String(userId), postId, {
    originalFileName: file.name,
    storedFilePath,
    memo,
  });

  return NextResponse.json({ photo }, { status: 201 });
}
