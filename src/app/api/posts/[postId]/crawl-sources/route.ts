import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById } from "@/lib/models/post";
import { listCrawlSources } from "@/lib/models/crawlSource";
import { getCrawlSummaryByPost } from "@/lib/models/crawlSummary";

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

  const post = getPostById(postId);
  if (!post || post.userId !== String(userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sources = listCrawlSources(String(userId), postId);
  const summary = getCrawlSummaryByPost(String(userId), postId);

  return NextResponse.json({ sources, summary });
}
