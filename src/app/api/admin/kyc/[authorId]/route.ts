import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = { params: Promise<{ authorId: string }> };

// GET /api/admin/kyc/[authorId] — get single author KYC
export async function GET(req: NextRequest, context: RouteContext) {
  const { authorId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return NextResponse.json({ error: "API not configured" }, { status: 503 });

  const res = await fetch(`${apiUrl}/admin/kyc/${authorId}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  const data = await res.json() as object;
  return NextResponse.json(data, { status: res.status });
}

// PATCH /api/admin/kyc/[authorId]/review — approve or reject
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { authorId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return NextResponse.json({ error: "API not configured" }, { status: 503 });

  const body = await req.json() as object;
  const res = await fetch(`${apiUrl}/admin/kyc/${authorId}/review`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as object;
  return NextResponse.json(data, { status: res.status });
}
