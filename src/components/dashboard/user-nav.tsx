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
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-semibold text-white">
        {initials}
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">
          {user.role} · {user.email}
        </p>
      </div>
    </div>
  );
}
