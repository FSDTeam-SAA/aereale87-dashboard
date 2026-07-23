import { AuthorSettingsPage } from "@/features/author-dashboard/settings/components/author-settings-page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  location: string | null;
};

const emptyProfile: ProfileData = {
  firstName: null,
  lastName: null,
  avatarUrl: null,
  location: null,
};

async function getProfile(accessToken: string): Promise<ProfileData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return emptyProfile;
    const json = (await res.json()) as {
      data?: { data?: { profile?: ProfileData }; profile?: ProfileData };
    };
    // GET /auth/me returns { data: { ...user, profile } } and the global
    // response interceptor wraps that again as { data: { data: ... } }.
    const me = json.data?.data ?? json.data;
    return me?.profile ?? emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const profile = await getProfile(session.accessToken);

  return (
    <AuthorSettingsPage
      accessToken={session.accessToken}
      email={session.user.email ?? ""}
      name={session.user.name ?? ""}
      isFoundingAuthor={session.user.isFoundingAuthor ?? false}
      initialProfile={profile}
    />
  );
}
