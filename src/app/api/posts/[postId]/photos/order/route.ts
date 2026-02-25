import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById } from "@/lib/models/post";
import { reorderPhotos } from "@/lib/models/photo";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = getPostById(postId);
  if (!post || post.userId !== String(userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const orderedPhotoIds = body.orderedPhotoIds;

  if (!Array.isArray(orderedPhotoIds) || orderedPhotoIds.length === 0) {
    return NextResponse.json({ error: "orderedPhotoIds 배열이 필요합니다." }, { status: 400 });
  }

  reorderPhotos(String(userId), postId, orderedPhotoIds);
  return NextResponse.json({ ok: true });
}
