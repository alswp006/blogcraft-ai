import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCategoryById } from "@/lib/models/category";
import { getStyleProfile } from "@/lib/models/styleProfile";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = getCategoryById(categoryId);
  if (!category || category.userId !== String(userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = getStyleProfile(String(userId), categoryId);
  return NextResponse.json({ profile });
}
