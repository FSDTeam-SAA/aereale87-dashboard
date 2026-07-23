"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

function AuthErrorListener({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/" });
    }
  }, [session]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <AuthErrorListener>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthErrorListener>
      <Toaster position="top-right" closeButton />
    </SessionProvider>
  );
}
