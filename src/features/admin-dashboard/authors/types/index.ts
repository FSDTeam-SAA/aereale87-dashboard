export type AuthorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type AdminAuthor = {
  id: string;
  email: string;
  username: string;
  role: "AUTHOR";
  verified: boolean;
  status: AuthorStatus;
  isFoundingAuthor: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
  bookCount: number;
};

export type PaginatedAuthors = {
  authors: AdminAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
