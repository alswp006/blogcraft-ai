import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createPost } from "@/lib/models/post";
import { createCategory } from "@/lib/models/category";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  const userId = token ? getSessionUserId(token) : null;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { categoryId, categoryName, locationName, overallNote } = body;

  if (!locationName?.trim() || !overallNote?.trim()) {
    return NextResponse.json({ error: "장소명과 메모는 필수입니다." }, { status: 400 });
  }

  let finalCategoryId = categoryId;

  // Create new category if name is given but no ID
  if (!finalCategoryId && categoryName?.trim()) {
    const cat = createCategory(String(userId), { name: categoryName.trim() });
    finalCategoryId = cat.id;
  }

  if (!finalCategoryId) {
    return NextResponse.json({ error: "카테고리를 선택하거나 새로 만들어주세요." }, { status: 400 });
  }

  const post = createPost(String(userId), {
    categoryId: finalCategoryId,
    locationName: locationName.trim(),
    overallNote: overallNote.trim(),
  });

  return NextResponse.json({ post }, { status: 201 });
}
