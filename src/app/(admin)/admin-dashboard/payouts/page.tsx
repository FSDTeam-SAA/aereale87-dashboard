import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getAdminPayouts } from "@/features/admin-dashboard/payouts/api/get-admin-payouts";
import { AdminPayoutsPage } from "@/features/admin-dashboard/payouts/components/admin-payouts-page";

export default async function AdminPayoutsRoute() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const data = await getAdminPayouts(session.accessToken);
  return <AdminPayoutsPage data={data} accessToken={session.accessToken} />;
}
