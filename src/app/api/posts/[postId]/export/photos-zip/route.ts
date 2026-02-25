import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById } from "@/lib/models/post";
import { listPhotosByPost } from "@/lib/models/photo";
import path from "path";
import fs from "fs";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = String(userId);
  const post = getPostById(postId);
  if (!post || post.userId !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const photos = listPhotosByPost(uid, postId);
  if (photos.length === 0) {
    return NextResponse.json({ error: "내보낼 사진이 없습니다." }, { status: 400 });
  }

  // Use archiver to create ZIP
  const archiver = (await import("archiver")).default;
  const { PassThrough } = await import("stream");

  const passthrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 5 } });

  archive.pipe(passthrough);

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    // storedFilePath is like /uploads/userId/postId/filename.jpg
    const filePath = path.join(process.cwd(), "public", photo.storedFilePath);
    const ext = path.extname(photo.originalFileName);
    const paddedIndex = String(i + 1).padStart(2, "0");
    const zipFileName = `${paddedIndex}_${photo.originalFileName}`;

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: zipFileName });
    } else {
      // Skip missing files
      archive.append(`File not found: ${photo.storedFilePath}`, {
        name: `${paddedIndex}_MISSING${ext}`,
      });
    }
  }

  await archive.finalize();

  // Read the archive stream into a buffer
  const chunks: Buffer[] = [];
  for await (const chunk of passthrough) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  const zipName = `${post.locationName.replace(/[^a-zA-Z0-9가-힣]/g, "_")}_photos.zip`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(zipName)}"`,
    },
  });
}
