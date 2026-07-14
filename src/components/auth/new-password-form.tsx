import { AuthButton } from "./auth-actions";
import { AuthShell } from "./auth-shell";
import { PasswordField } from "./password-field";

export function NewPasswordForm() {
  return (
    <AuthShell className="max-w-[340px] px-5 py-5">
      <div className="space-y-1">
        <h1 className="text-[16px] font-semibold text-[#263f37]">New Password</h1>
        <p className="text-[10px] leading-4 text-[#8c8780]">
          Please create your new password
        </p>
      </div>

      <form className="mt-5 space-y-3">
        <PasswordField label="Create a password" placeholder="Create a password" />
        <PasswordField label="Confirm Password" placeholder="Confirm your password" />
        <AuthButton href="/">Continue</AuthButton>
      </form>
    </AuthShell>
  );
}
