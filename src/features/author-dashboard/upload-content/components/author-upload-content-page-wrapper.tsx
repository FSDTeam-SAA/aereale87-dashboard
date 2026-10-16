"use client";

import dynamic from "next/dynamic";

const AuthorUploadContentPage = dynamic(
  () => import("./author-upload-content-page").then((m) => m.AuthorUploadContentPage),
  { ssr: false },
);

export function AuthorUploadContentPageWrapper({
  accessToken,
  isFoundingAuthor,
  authorName,
}: {
  accessToken: string;
  isFoundingAuthor?: boolean;
  authorName?: string;
}) {
  return (
    <AuthorUploadContentPage
      accessToken={accessToken}
      isFoundingAuthor={isFoundingAuthor}
      authorName={authorName}
    />
  );
}

