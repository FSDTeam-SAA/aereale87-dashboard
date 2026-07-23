import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Session refresh failed");
  return payload.data as { accessToken: string; refreshToken: string };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          }),
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Invalid credentials");
        const user = payload.data?.user;
        const tokens = payload.data?.tokens;
        if (!user || !tokens) return null;
        if (!["AUTHOR", "ADMIN", "SUPERADMIN"].includes(user.role)) {
          throw new Error("This account cannot access the dashboard");
        }
        return {
          id: user.id,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.username,
          email: user.email,
          role: user.role,
          isFoundingAuthor: user.isFoundingAuthor,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          isFoundingAuthor: user.isFoundingAuthor,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
        };
      }
      if (Date.now() < token.accessTokenExpires) return token;
      try {
        const refreshed = await refreshAccessToken(token.refreshToken);
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
          error: undefined,
        };
      } catch {
        return {
          ...token,
          error: "RefreshAccessTokenError",
          accessTokenExpires: Date.now() + 30 * 1000,
        };
      }
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isFoundingAuthor = token.isFoundingAuthor;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
