import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { listCategoriesByUser, createCategory } from "@/lib/models/category";
import { validateStringLen } from "@/lib/validation";

function getUserId(request: Request): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = listCategoriesByUser(String(userId));
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = (body.name ?? "").trim();
  const description = body.description?.trim() || null;

  const nameErr = validateStringLen(name, { min: 1, max: 50 });
  if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

  // Check duplicate
  const existing = listCategoriesByUser(String(userId));
  if (existing.some((c) => c.name === name)) {
    return NextResponse.json({ error: "이미 같은 이름의 카테고리가 있습니다." }, { status: 409 });
  }

  const category = createCategory(String(userId), { name, description });
  return NextResponse.json({ category }, { status: 201 });
}
