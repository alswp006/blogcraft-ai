import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById } from "@/lib/models/post";
import { insertCrawlSources } from "@/lib/models/crawlSource";
import { upsertCrawlSummary } from "@/lib/models/crawlSummary";
import { generateMockCrawlData, generateMockSummary } from "@/lib/crawl/mockCrawl";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function POST(
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

  // Delete existing crawl data for re-crawling
  const { execute } = await import("@/lib/db");
  execute("DELETE FROM crawl_sources WHERE userId = ? AND postId = ?", String(userId), postId);

  // Generate mock crawl data
  const mockSources = generateMockCrawlData(post.locationName);
  const sources = insertCrawlSources(String(userId), postId, mockSources);

  // Generate and save summary
  const mockSummary = generateMockSummary(post.locationName, mockSources);
  const summary = upsertCrawlSummary(String(userId), postId, mockSummary);

  return NextResponse.json({ sources, summary }, { status: 201 });
}
