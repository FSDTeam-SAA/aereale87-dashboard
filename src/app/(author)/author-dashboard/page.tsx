import { AuthorDashboardOverview } from "@/features/author-dashboard/dashboard-overview/components/author-dashboard-overview";
import { getAuthorDashboardOverview } from "@/features/author-dashboard/dashboard-overview/api/get-author-dashboard-overview";

export default async function AuthorDashboardPage() {
  const data = await getAuthorDashboardOverview();

  return <AuthorDashboardOverview data={data} />;
}
