import { ShieldCheck } from "lucide-react";

export function AuthBrand() {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="mb-2 flex size-16 items-center justify-center rounded-full border-4 border-[#9f8a23] bg-[radial-gradient(circle_at_top,_#f6e27f,_#d2ab26_68%,_#9f7d0d_100%)] shadow-[0_8px_24px_-14px_rgba(159,125,13,0.85)]">
        <ShieldCheck className="size-8 text-[#214238]" strokeWidth={2.3} />
      </div>
      <p className="text-[13px] font-semibold text-[#5b4e12]">Wonder Emporium</p>
    </div>
  );
}
