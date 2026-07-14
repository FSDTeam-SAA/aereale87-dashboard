"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { AuthField } from "./auth-field";

type PasswordFieldProps = {
  label: string;
  placeholder?: string;
};

export function PasswordField({ label, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      label={label}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      icon={<Lock className="size-3.5" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="cursor-pointer text-[#7e9f97] transition-colors hover:text-[#24463d]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      }
    />
  );
}
