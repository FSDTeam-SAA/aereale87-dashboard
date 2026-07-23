import { AuthorBooksPageView } from "@/features/author-dashboard/books/components/author-books-page-view";
import { getAuthorBooks } from "@/features/author-dashboard/books/api/get-author-books";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthorBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAuthorBooks(session.accessToken);

  return <AuthorBooksPageView data={data} accessToken={session.accessToken} />;
}
