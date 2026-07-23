import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; role: string; isFoundingAuthor?: boolean };
    accessToken: string;
    error?: "RefreshAccessTokenError";
  }
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
    isFoundingAuthor?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isFoundingAuthor?: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshAccessTokenError";
  }
}
