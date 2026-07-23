import { AuthorOrdersPage } from "@/features/author-dashboard/orders/components/author-orders-page";
import { getAuthorOrders } from "@/features/author-dashboard/orders/api/get-author-orders";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAuthorOrders(session.accessToken);

  return <AuthorOrdersPage data={data} accessToken={session.accessToken} />;
}
