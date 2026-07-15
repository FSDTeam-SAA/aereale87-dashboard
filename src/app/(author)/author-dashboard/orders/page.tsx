import { AuthorOrdersPage } from "@/features/author-dashboard/orders/components/author-orders-page";
import { getAuthorOrders } from "@/features/author-dashboard/orders/api/get-author-orders";

export default async function OrdersPage() {
  const data = await getAuthorOrders();

  return <AuthorOrdersPage data={data} />;
}
