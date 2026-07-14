import { AdminDashboardOverview } from "@/features/admin-dashboard/dashboard-overview/components/admin-dashboard-overview";
import { getAdminDashboardOverview } from "@/features/admin-dashboard/dashboard-overview/api/get-admin-dashboard-overview";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardOverview();

  return <AdminDashboardOverview data={data} />;
}
