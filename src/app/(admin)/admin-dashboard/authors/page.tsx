import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getAuthors } from "@/features/admin-dashboard/authors/api/authors.api";
import { AuthorsPage } from "@/features/admin-dashboard/authors/components/authors-page";

export default async function AdminAuthorsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAuthors(session.accessToken);
  return <AuthorsPage data={data} accessToken={session.accessToken} />;
}
