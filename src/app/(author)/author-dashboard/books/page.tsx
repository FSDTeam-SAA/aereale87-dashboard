import { AuthorBooksPageView } from "@/features/author-dashboard/books/components/author-books-page-view";
import { getAuthorBooks } from "@/features/author-dashboard/books/api/get-author-books";

export default async function AuthorBooksPage() {
  const data = await getAuthorBooks();

  return <AuthorBooksPageView data={data} />;
}
