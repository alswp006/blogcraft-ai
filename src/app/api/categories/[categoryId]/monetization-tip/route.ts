import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCategoryById } from "@/lib/models/category";
import { getMonetizationTip, upsertMonetizationTip } from "@/lib/models/monetizationTip";
import { validateStringLen } from "@/lib/validation";

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

  const tip = getMonetizationTip(String(userId), categoryId);
  return NextResponse.json({ tip });
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
  const recommendedMethod = (body.recommendedMethod ?? "").trim();
  const tipText = (body.tipText ?? "").trim();

  const methodErr = validateStringLen(recommendedMethod, { min: 1, max: 60 });
  if (methodErr) return NextResponse.json({ error: "추천 방법은 1-60자여야 합니다." }, { status: 400 });

  const tipErr = validateStringLen(tipText, { min: 1, max: 500 });
  if (tipErr) return NextResponse.json({ error: "팁 내용은 1-500자여야 합니다." }, { status: 400 });

  const tip = upsertMonetizationTip(String(userId), categoryId, {
    recommendedMethod,
    tipText,
  });

  return NextResponse.json({ tip }, { status: 201 });
}
