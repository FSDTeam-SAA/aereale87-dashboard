import { AuthorPayoutPreferencesPage } from "@/features/author-dashboard/payout-preferences/components/author-payout-preferences-page";
import { getAuthorPayoutPreferences } from "@/features/author-dashboard/payout-preferences/api/get-author-payout-preferences";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PayoutPreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const data = await getAuthorPayoutPreferences(session.accessToken);

  return (
    <AuthorPayoutPreferencesPage
      data={data}
      accessToken={session.accessToken}
      email={session.user.email ?? ""}
    />
  );
}
