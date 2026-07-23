import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthorUploadContentPageWrapper } from "@/features/author-dashboard/upload-content/components/author-upload-content-page-wrapper";

async function getIsFoundingAuthor(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as {
      data?: { data?: { isFoundingAuthor?: boolean }; isFoundingAuthor?: boolean };
    };
    const me = json.data?.data ?? json.data;
    return me?.isFoundingAuthor ?? false;
  } catch {
    return false;
  }
}

export default async function UploadContentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const isFoundingAuthor =
    (await getIsFoundingAuthor(session.accessToken)) ||
    session.user.isFoundingAuthor === true;

  return (
    <AuthorUploadContentPageWrapper
      accessToken={session.accessToken}
      isFoundingAuthor={isFoundingAuthor}
    />
  );
}
