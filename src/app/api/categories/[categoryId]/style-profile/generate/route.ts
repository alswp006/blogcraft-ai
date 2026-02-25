import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCategoryById } from "@/lib/models/category";
import {
  countLearningSamplesForCategory,
  listLearningSamplesForCategory,
} from "@/lib/models/learningSample";
import { upsertStyleProfile } from "@/lib/models/styleProfile";
import { generateStyleProfile, isOpenAIConfigured } from "@/lib/openai";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function POST(
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

  const sampleCount = countLearningSamplesForCategory(String(userId), categoryId);
  if (sampleCount < 5) {
    return NextResponse.json(
      { error: "스타일 프로필을 생성하려면 최소 5개의 학습 샘플이 필요합니다." },
      { status: 409 },
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "OpenAI API가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const samples = listLearningSamplesForCategory(String(userId), categoryId);
  const profileJson = await generateStyleProfile(samples);

  const profile = upsertStyleProfile(String(userId), categoryId, {
    profileJson,
    sampleCount: samples.length,
  });

  return NextResponse.json({ profile }, { status: 201 });
}
