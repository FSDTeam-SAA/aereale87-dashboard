"use client";

import dynamic from "next/dynamic";

const AuthorUploadContentPage = dynamic(
  () => import("./author-upload-content-page").then((m) => m.AuthorUploadContentPage),
  { ssr: false },
);

export function AuthorUploadContentPageWrapper({
  accessToken,
  isFoundingAuthor,
}: {
  accessToken: string;
  isFoundingAuthor?: boolean;
}) {
  return <AuthorUploadContentPage accessToken={accessToken} isFoundingAuthor={isFoundingAuthor} />;
}
