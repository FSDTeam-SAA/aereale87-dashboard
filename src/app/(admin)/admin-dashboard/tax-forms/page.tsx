import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminTaxFormsPage } from "@/features/admin-dashboard/tax-forms/components/admin-tax-forms-page";
import type { AdminTaxFormRecord } from "@/features/admin-dashboard/tax-forms/types";

export const dynamic = "force-dynamic";

export default async function AdminTaxFormsRoute() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let taxForms: AdminTaxFormRecord[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/kyc`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (res.ok) {
      const payload = await res.json();
      taxForms = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
    }
  } catch (error) {
    console.error("[tax-forms] Error fetching admin KYC records:", error);
    taxForms = [];
  }

  return (
    <AdminTaxFormsPage
      initialData={taxForms}
      accessToken={session.accessToken}
    />
  );
}
