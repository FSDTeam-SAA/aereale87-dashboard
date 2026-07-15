import { AuthorPayoutPreferencesPage } from "@/features/author-dashboard/payout-preferences/components/author-payout-preferences-page";
import { getAuthorPayoutPreferences } from "@/features/author-dashboard/payout-preferences/api/get-author-payout-preferences";

export default async function PayoutPreferencesPage() {
  const data = await getAuthorPayoutPreferences();

  return <AuthorPayoutPreferencesPage data={data} />;
}
