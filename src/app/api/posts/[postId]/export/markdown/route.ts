import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getPostById, updatePost } from "@/lib/models/post";

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

  if (!post.contentMarkdown) {
    return NextResponse.json({ error: "내보낼 본문이 없습니다." }, { status: 400 });
  }

  // Build markdown file content
  const markdown = `# ${post.title || post.locationName}\n\n${post.contentMarkdown}`;
  const fileName = `${post.locationName.replace(/[^a-zA-Z0-9가-힣]/g, "_")}.md`;

  // Update status to exported
  if (post.status === "generated") {
    updatePost(postId, uid, { status: "exported" });
  }

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  });
}
