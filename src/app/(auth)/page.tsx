import { SignInForm } from "@/components/auth/sign-in-form";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
