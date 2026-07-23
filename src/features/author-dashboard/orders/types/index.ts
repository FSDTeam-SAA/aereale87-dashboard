export type AuthorOrderStatus =
  | "Pending request"
  | "Requested"
  | "Approved"
  | "Paid"
  | "Rejected";

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
  payoutId: string;
  orderId: string;
  customer: string;
  products: string;
  amount: string;
  date: string;
  status: AuthorOrderStatus;
  payoutStatus: string;
  canRequestPayout: boolean;
};

export type AuthorOrdersData = {
  summary: AuthorOrderSummary[];
  tabs: AuthorOrderTab[];
  orders: AuthorOrderRecord[];
};
