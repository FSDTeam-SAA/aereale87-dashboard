export type AuthorOrderStatus = "Completed" | "Cancelled";

export type AuthorOrderTab = {
  id: string;
  label: string;
  active?: boolean;
};

export type AuthorOrderSummary = {
  id: string;
  label: string;
  value: string;
};

export type AuthorOrderRecord = {
  id: string;
  orderId: string;
  customer: string;
  products: string;
  amount: string;
  date: string;
  status: AuthorOrderStatus;
};

export type AuthorOrdersData = {
  summary: AuthorOrderSummary[];
  tabs: AuthorOrderTab[];
  orders: AuthorOrderRecord[];
};
