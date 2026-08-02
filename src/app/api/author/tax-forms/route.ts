import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const idFrontFile = formData.get("idFront");
  const idBackFile = formData.get("idBack");
  const taxFormFile = formData.get("taxFormFile"); // optional PDF
  const taxFormType = formData.get("taxFormType");
  const taxpayerName = formData.get("taxpayerName");
  const taxId = formData.get("taxId");
  const taxCountry = formData.get("taxCountry");

  if (!(idFrontFile instanceof File) || !(idBackFile instanceof File)) {
    return NextResponse.json({ error: "Both ID front and back images are required." }, { status: 400 });
  }
  if (!taxFormType || !taxpayerName || !taxId || !taxCountry) {
    return NextResponse.json({ error: "Tax form fields (taxFormType, taxpayerName, taxId, taxCountry) are required." }, { status: 400 });
  }
  for (const [label, file] of [["ID front", idFrontFile], ["ID back", idBackFile]] as [string, File][]) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type for ${label}: ${file.type}` }, { status: 422 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${label} exceeds 5MB size limit.` }, { status: 422 });
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const backendForm = new FormData();
      backendForm.append("idFront", idFrontFile);
      backendForm.append("idBack", idBackFile);
      if (taxFormFile instanceof File) backendForm.append("taxFormFile", taxFormFile);
      backendForm.append("taxFormType", taxFormType as string);
      backendForm.append("taxpayerName", taxpayerName as string);
      backendForm.append("taxId", taxId as string);
      backendForm.append("taxCountry", taxCountry as string);

      const backendRes = await fetch(`${apiUrl}/author/kyc/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: backendForm,
      });

      const json = (await backendRes.json()) as { message?: string; error?: string; kycStatus?: string };
      if (!backendRes.ok) {
        return NextResponse.json({ error: json.error ?? json.message ?? "Backend upload failed." }, { status: backendRes.status });
      }
      return NextResponse.json({ message: json.message ?? "Documents submitted successfully.", kycStatus: json.kycStatus }, { status: 200 });
    } catch (err) {
      console.error("[tax-forms] Backend request failed:", err);
      return NextResponse.json({ error: "Failed to reach the document service. Please try again later." }, { status: 502 });
    }
  }

  // Dev fallback
  console.log(`[kyc] Received submission from ${session.user.email}:`, {
    idFront: idFrontFile.name, idBack: idBackFile.name,
    taxFormType, taxpayerName, taxCountry,
  });
  return NextResponse.json({ message: "Documents submitted. Pending admin review.", kycStatus: "SUBMITTED" }, { status: 200 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/author/kyc/status`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: "no-store",
      });
      const json = await res.json() as object;
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Failed to fetch KYC status" }, { status: 502 });
    }
  }

  return NextResponse.json({ kycStatus: "NOT_SUBMITTED", submittedAt: null, reviewedAt: null, adminNote: null });
}
