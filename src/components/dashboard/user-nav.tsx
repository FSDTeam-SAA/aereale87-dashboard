type UserNavProps = {
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function UserNav({ user }: UserNavProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#24352f] text-sm font-semibold text-white ring-1 ring-black/10">
        {initials}
      </div>
    </div>
  );
}
