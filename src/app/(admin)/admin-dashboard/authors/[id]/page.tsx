import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getAuthor } from "@/features/admin-dashboard/authors/api/authors.api";
import { AuthorStatusAction } from "@/features/admin-dashboard/authors/components/author-status-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminAuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const { id } = await params;
  let author;
  try { author = await getAuthor(id, session.accessToken); } catch { notFound(); }
  const name = `${author.profile?.firstName || ""} ${author.profile?.lastName || ""}`.trim() || author.username;
  return <div className="space-y-6"><Link href="/admin-dashboard/authors" className="text-sm font-medium text-[#997b1e]">← Back to authors</Link><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm uppercase tracking-wider text-slate-500">Author profile</p><h1 className="mt-1 text-3xl font-bold text-slate-950">{name}</h1><p className="mt-1 text-slate-500">Joined {new Date(author.createdAt).toLocaleDateString()}</p></div><AuthorStatusAction id={author.id} status={author.status} accessToken={session.accessToken} /></div><div className="grid gap-4 lg:grid-cols-2"><Card className="bg-white"><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="space-y-3"><Detail label="Email" value={author.email} /><Detail label="Username" value={author.username} /><Detail label="Status" value={author.status === "INACTIVE" ? "Pending approval" : author.status} /><Detail label="Email verified" value={author.verified ? "Yes" : "No"} /><Detail label="Published workspace books" value={String(author.bookCount)} /></CardContent></Card><Card className="bg-white"><CardHeader><CardTitle>Author profile</CardTitle></CardHeader><CardContent className="space-y-3"><Detail label="First name" value={author.profile?.firstName || "—"} /><Detail label="Last name" value={author.profile?.lastName || "—"} /><Detail label="Founding author" value={author.isFoundingAuthor ? "Yes" : "No"} /><div><p className="text-xs uppercase tracking-wider text-slate-500">Bio</p><p className="mt-1 text-sm text-slate-800">{author.profile?.bio || "No biography provided."}</p></div></CardContent></Card></div></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-medium text-slate-900">{value}</span></div>; }
