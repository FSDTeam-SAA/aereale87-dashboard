import { AuthorDashboardOverview } from "@/features/author-dashboard/dashboard-overview/components/author-dashboard-overview";
import { getAuthorDashboardOverview } from "@/features/author-dashboard/dashboard-overview/api/get-author-dashboard-overview";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthorDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAuthorDashboardOverview(session.accessToken);

  return <AuthorDashboardOverview data={data} />;
}
