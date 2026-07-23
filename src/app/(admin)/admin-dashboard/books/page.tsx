import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPendingBooks } from "@/features/admin-dashboard/books/api/get-pending-books";
import { AdminBooksApprovalPage } from "@/features/admin-dashboard/books/components/admin-books-approval-page";

export default async function AdminBooksApprovalsRoute() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) redirect("/");

  const data = await getPendingBooks(session.accessToken);
  return <AdminBooksApprovalPage data={data} accessToken={session.accessToken} />;
}
