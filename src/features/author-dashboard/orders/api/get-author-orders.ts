import type { AuthorOrdersData } from "../types";

export async function getAuthorOrders(): Promise<AuthorOrdersData> {
  return Promise.resolve({
    summary: [
      { id: "total-orders", label: "Total Orders", value: "1,248" },
      { id: "completed-orders", label: "Completed Orders", value: "987" },
      { id: "revenue-generated", label: "Revenue Generated", value: "$5469" },
    ],
    tabs: [
      { id: "all", label: "All Orders (10,748)", active: true },
      { id: "completed", label: "Completed (9,842)" },
      { id: "cancelled", label: "Cancelled (32)" },
    ],
    orders: [
      {
        id: "order-1",
        orderId: "#ORD- 10248",
        customer: "Sarah Johnson",
        products: "3 Items",
        amount: "$84.99",
        date: "Oct 12, 2021",
        status: "Completed",
      },
      {
        id: "order-2",
        orderId: "#ORD- 10249",
        customer: "Michael Lee",
        products: "1 Item",
        amount: "$29.99",
        date: "Oct 13, 2021",
        status: "Completed",
      },
      {
        id: "order-3",
        orderId: "#ORD- 10250",
        customer: "Emily Davis",
        products: "5 Items",
        amount: "$120.50",
        date: "Oct 14, 2021",
        status: "Completed",
      },
      {
        id: "order-4",
        orderId: "#ORD- 10251",
        customer: "James Martinez",
        products: "2 Items",
        amount: "$45.75",
        date: "Oct 15, 2021",
        status: "Completed",
      },
      {
        id: "order-5",
        orderId: "#ORD- 10252",
        customer: "Sophia Lee",
        products: "5 Items",
        amount: "$98.40",
        date: "Oct 16, 2021",
        status: "Completed",
      },
      {
        id: "order-6",
        orderId: "#ORD- 10253",
        customer: "Liam Johnson",
        products: "1 Item",
        amount: "$15.00",
        date: "Oct 17, 2021",
        status: "Completed",
      },
      {
        id: "order-7",
        orderId: "#ORD- 10254",
        customer: "Olivia Brown",
        products: "3 Items",
        amount: "$60.25",
        date: "Oct 18, 2021",
        status: "Completed",
      },
    ],
  });
}
