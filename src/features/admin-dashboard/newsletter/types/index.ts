export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: string;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedNewsletterSubscribers = {
  subscribers: NewsletterSubscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
