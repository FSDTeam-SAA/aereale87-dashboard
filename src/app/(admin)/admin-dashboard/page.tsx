import { AdminDashboardOverview } from "@/features/admin-dashboard/dashboard-overview/components/admin-dashboard-overview";
import { getAdminDashboardOverview } from "@/features/admin-dashboard/dashboard-overview/api/get-admin-dashboard-overview";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAdminDashboardOverview(session.accessToken);

  return <AdminDashboardOverview data={data} />;
}
