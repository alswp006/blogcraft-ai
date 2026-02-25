import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { listCategoriesByUser } from "@/lib/models/category";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  const userId = token ? getSessionUserId(token) : null;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = listCategoriesByUser(String(userId));
  return NextResponse.json({ categories });
}
