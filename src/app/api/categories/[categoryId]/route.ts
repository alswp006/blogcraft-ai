import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCategoryById, deleteCategory } from "@/lib/models/category";

function getUserId(request: NextRequest): number | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  return token ? getSessionUserId(token) : null;
}

export async function DELETE(
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

  const deleted = deleteCategory(categoryId, String(userId));
  if (!deleted) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
