import { ChevronDown, Eye, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-base text-neutral-800">{children}</div>;
}

function FilledField({
  value,
  accent = "neutral",
  rightSlot,
}: {
  value: string;
  accent?: "neutral" | "strong";
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex h-12 items-center gap-1 border border-stone-300 bg-stone-100 px-3 py-2.5">
      <div
        className={`flex-1 text-base font-bold ${
          accent === "strong" ? "text-teal-950" : "text-neutral-500"
        }`}
      >
        {value}
      </div>
      {rightSlot}
    </div>
  );
}

function ProfileRow({
  label,
  value,
  rightSlot,
  accent,
}: {
  label: string;
  value: string;
  rightSlot?: React.ReactNode;
  accent?: "neutral" | "strong";
}) {
  return (
    <div className="flex-1 space-y-3">
      <Label>{label}</Label>
      <FilledField value={value} rightSlot={rightSlot} accent={accent} />
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute left-[104px] top-[-3px] flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1">
      <div className="flex size-2.5 items-center justify-center">
        <div className="size-2 rounded-full border border-amber-800" />
      </div>
      <div className="text-xs leading-4 text-amber-800">
        <span className="font-medium">Founding </span>
        <span>Author</span>
      </div>
    </div>
  );
}

function CountryCode() {
  return (
    <div className="flex items-center gap-1 overflow-hidden border-l border-[#d9d9d9] pl-3">
      <div className="relative h-6 w-8 overflow-hidden rounded-[2px] bg-gradient-to-b from-rose-600 to-rose-700">
        <div className="absolute left-0 top-0 h-3 w-4 bg-slate-700" />
        <div className="absolute left-[1.53px] top-[1.53px] h-2 w-2.5 bg-white" />
      </div>
      <ChevronDown className="size-5 text-neutral-500" strokeWidth={1.8} />
    </div>
  );
}

function PasswordField({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <div className="text-base text-neutral-800">{label}</div>
      <div className="flex h-12 items-center gap-1 border border-stone-300 bg-stone-100 px-3 py-2.5">
        <div className="flex-1 text-sm text-neutral-500">Enter password</div>
        <Eye className="size-5 text-neutral-500" strokeWidth={1.7} />
      </div>
    </div>
  );
}

export function AuthorSettingsPage() {
  return (
    <div className="space-y-5">
      <Card className="rounded-none bg-white py-0 shadow-none ring-1 ring-stone-300">
        <CardContent className="p-5">
          <div className="flex flex-col items-center gap-8">
            <div className="flex w-full flex-col gap-3.5">
              <div className="flex items-start justify-between">
                <div className="text-lg font-bold leading-6 text-zinc-800">Profile Update</div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative size-24 rounded-full bg-[radial-gradient(circle_at_40%_35%,#f7dcb8_0%,#b4704c_40%,#74473b_100%)]" />
                <div className="relative flex flex-1 flex-col items-start gap-2">
                  <div className="text-base font-bold leading-5 text-neutral-800">Wade Warren</div>
                  <div className="flex items-center gap-4">
                    <div className="text-base leading-5 text-neutral-500">wade.warren@example.com</div>
                    <Pencil className="size-4 text-orange-400" strokeWidth={1.7} />
                  </div>
                  <Badge />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-6">
              <div className="grid gap-5 md:grid-cols-2">
                <ProfileRow label="First Name" value="Wade " />
                <ProfileRow label="Last Name" value="Warren" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ProfileRow
                  label="Password"
                  value="***********"
                  accent="strong"
                  rightSlot={<Eye className="size-5 text-neutral-500" strokeWidth={1.7} />}
                />
                <ProfileRow
                  label="Phone Number"
                  value="(406) 555-0120"
                  rightSlot={<CountryCode />}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ProfileRow label="E-mail" value="wade.warren@example.com" />
                <ProfileRow
                  label="Location"
                  value="2972 Westheimer Rd. Santa Ana, Illinois 85486 "
                />
              </div>

              <div className="space-y-3">
                <Label>Biography</Label>
                <div className="flex h-28 items-start overflow-hidden border border-stone-300 bg-stone-100 p-3 text-base leading-6 text-neutral-500">
                  Enter a biography about you
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none bg-white py-0 shadow-none ring-1 ring-stone-300">
        <CardContent className="p-4">
          <div className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="text-base font-bold leading-5 text-neutral-800">Change Password</div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <PasswordField label="Current Password" />
                  <div className="text-base text-orange-400">
                    Forgot Current Password? Click here
                  </div>
                </div>

                <PasswordField label="New Password" />
                <PasswordField label="Re-enter Password" />
              </div>
            </div>

            <button
              type="button"
              className="flex h-10 items-center justify-center bg-orange-400 px-3 py-2.5 text-base font-bold text-white"
            >
              Save Change
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
