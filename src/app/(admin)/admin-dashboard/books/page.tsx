import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPendingBooks } from "@/features/admin-dashboard/books/api/get-pending-books";
import { getAllBooks } from "@/features/admin-dashboard/books/api/get-all-books";
import { AdminBooksApprovalPage } from "@/features/admin-dashboard/books/components/admin-books-approval-page";

export const dynamic = "force-dynamic";

export default async function AdminBooksApprovalsRoute() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) redirect("/");

  const [pendingData, catalogData] = await Promise.all([
    getPendingBooks(session.accessToken).catch(() => ({ books: [], total: 0 })),
    getAllBooks(session.accessToken).catch(() => ({ books: [], total: 0 })),
  ]);

  return (
    <AdminBooksApprovalPage
      pendingData={pendingData}
      catalogData={catalogData}
      accessToken={session.accessToken}
    />
  );
}
