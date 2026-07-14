type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageTitle({ eyebrow, title, description }: PageTitleProps) {
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
