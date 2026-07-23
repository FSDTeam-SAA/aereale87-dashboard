import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getNewsletterSubscribers } from "@/features/admin-dashboard/newsletter/api/newsletter.api";
import { SubscribersPage } from "@/features/admin-dashboard/newsletter/components/subscribers-page";

export default async function AdminSubscribersRoute() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) redirect("/");

  const data = await getNewsletterSubscribers(session.accessToken);
  return <SubscribersPage data={data} />;
}
