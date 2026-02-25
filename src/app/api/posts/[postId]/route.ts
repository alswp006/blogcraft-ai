import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById, updatePost, deletePost } from "@/lib/models/post";
import { listPhotosByPost } from "@/lib/models/photo";
import { getCrawlSummaryByPost } from "@/lib/models/crawlSummary";
import { listCrawlSources } from "@/lib/models/crawlSource";
import { getLatestPostVersion } from "@/lib/models/postVersion";
import { getLatestPlagiarismCheck } from "@/lib/models/plagiarismCheck";
import { getLatestSeoAnalysis } from "@/lib/models/seoAnalysis";

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
  const crawlSummary = getCrawlSummaryByPost(uid, postId);
  const crawlSources = listCrawlSources(uid, postId);
  const latestVersion = getLatestPostVersion(uid, postId);
  const plagiarismCheck = latestVersion
    ? getLatestPlagiarismCheck(uid, postId, latestVersion.id)
    : null;
  const seoAnalysis = latestVersion
    ? getLatestSeoAnalysis(uid, postId, latestVersion.id)
    : null;

  return NextResponse.json({
    post,
    photos,
    crawlSummary,
    crawlSources,
    latestVersion,
    plagiarismCheck,
    seoAnalysis,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const post = updatePost(postId, String(userId), body);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete photos first (child table)
  const { execute } = await import("@/lib/db");
  execute("DELETE FROM photos WHERE postId = ? AND userId = ?", postId, String(userId));

  const deleted = deletePost(postId, String(userId));
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
