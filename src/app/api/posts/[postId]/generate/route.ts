import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById, updatePost } from "@/lib/models/post";
import { listPhotosByPost } from "@/lib/models/photo";
import { getStyleProfile } from "@/lib/models/styleProfile";
import { getCrawlSummaryByPost } from "@/lib/models/crawlSummary";
import { listCrawlSources } from "@/lib/models/crawlSource";
import { createPostVersionNext } from "@/lib/models/postVersion";
import { createPlagiarismCheck } from "@/lib/models/plagiarismCheck";
import { createSeoAnalysis } from "@/lib/models/seoAnalysis";
import { generatePostContent, isOpenAIConfigured } from "@/lib/openai";
import { analyzeSeo } from "@/lib/analysis/seoAnalyzer";
import { checkPlagiarism } from "@/lib/analysis/plagiarismChecker";

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

  const uid = String(userId);
  const post = getPostById(postId);
  if (!post || post.userId !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json({ error: "OpenAI API가 설정되지 않았습니다." }, { status: 503 });
  }

  // Gather data
  const styleProfile = getStyleProfile(uid, post.categoryId);
  const photos = listPhotosByPost(uid, postId);
  const crawlSummary = getCrawlSummaryByPost(uid, postId);
  const crawlSources = listCrawlSources(uid, postId);

  // Generate content via OpenAI
  const { title, contentMarkdown } = await generatePostContent({
    styleProfile: styleProfile?.profileJson ?? "{}",
    locationName: post.locationName,
    overallNote: post.overallNote,
    photos: photos.map((p) => ({ originalFileName: p.originalFileName, memo: p.memo })),
    crawlSummary: crawlSummary?.summaryText,
    crawlSources: crawlSources.map((s) => ({ provider: s.provider, snippetText: s.snippetText })),
  });

  // Create post version
  const version = createPostVersionNext(uid, postId, {
    title,
    contentMarkdown,
  });

  // Update post
  updatePost(postId, uid, { title, contentMarkdown, status: "generated" });

  // Plagiarism check
  const plagiarismResult = checkPlagiarism(
    contentMarkdown,
    crawlSources.map((s) => ({ id: s.id, snippetText: s.snippetText })),
  );
  const plagiarismCheck = createPlagiarismCheck(uid, postId, version.id, plagiarismResult);

  // SEO analysis
  const seoScores = analyzeSeo(title, contentMarkdown, post.locationName);
  const seoAnalysis = createSeoAnalysis(uid, postId, version.id, seoScores);

  return NextResponse.json({
    version,
    plagiarismCheck,
    seoAnalysis,
    post: getPostById(postId),
  }, { status: 201 });
}
