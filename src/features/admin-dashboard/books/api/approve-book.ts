export async function approveBook(
  bookId: string,
  status: "APPROVED" | "REJECTED",
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.message || "Failed to update book status.");
  }
}
