export type AuthorBookStatus = "Pending" | "Approved";

export type AuthorBooksSummary = {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle: string;
};

export type AuthorBookTab = {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
};

export type AuthorBookRecord = {
  id: string;
  title: string;
  views: string;
  sales: string;
  price: string;
  revenue: string;
  status: AuthorBookStatus;
  accent: "amber" | "green";
  coverTone: string;
};

export type AuthorBooksData = {
  summary: AuthorBooksSummary[];
  tabs: AuthorBookTab[];
  books: AuthorBookRecord[];
};
