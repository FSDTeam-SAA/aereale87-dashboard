import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Suspense } from "react";

export default function NewPasswordPage() {
  return <Suspense fallback={null}><NewPasswordForm /></Suspense>;
}
