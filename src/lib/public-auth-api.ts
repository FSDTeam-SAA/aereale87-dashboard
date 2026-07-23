type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

async function request<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "The request failed.");
  return payload;
}

export const publicAuthApi = {
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", { email }),
  resendPasswordReset: (email: string) =>
    request<{ message: string }>("/auth/resend-password-reset", { email }),
  verifyPasswordResetOtp: (email: string, otp: string) =>
    request<{ message: string }>("/auth/verify-password-reset-otp", { email, otp }),
  resetPassword: (email: string, otp: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", { email, otp, password }),
};
