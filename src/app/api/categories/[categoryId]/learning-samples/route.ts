import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCategoryById } from "@/lib/models/category";
import {
  createLearningSample,
  listLearningSamplesForCategory,
} from "@/lib/models/learningSample";
import { validateStringLen, oneOf } from "@/lib/validation";

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

  const samples = listLearningSamplesForCategory(String(userId), categoryId);
  return NextResponse.json({ samples });
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

  const body = await request.json();
  const sourceType = body.sourceType;
  const sourceUrl = body.sourceUrl ?? null;
  const rawText = body.rawText ?? "";

  if (!oneOf(sourceType, ["url", "file"])) {
    return NextResponse.json({ error: "sourceType은 url 또는 file이어야 합니다." }, { status: 400 });
  }

  const textErr = validateStringLen(rawText, { min: 200 });
  if (textErr) {
    return NextResponse.json({ error: "본문은 200자 이상이어야 합니다." }, { status: 400 });
  }

  const sample = createLearningSample(String(userId), categoryId, {
    sourceType,
    sourceUrl,
    rawText,
  });

  return NextResponse.json({ sample }, { status: 201 });
}
