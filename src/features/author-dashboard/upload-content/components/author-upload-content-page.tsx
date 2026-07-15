import { ChevronDown, CircleHelp, FileUp, Plus, Upload } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function SectionLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="text-base font-bold text-teal-950">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
    </div>
  );
}

function SoftInput({ value }: { value: string }) {
  return (
    <div className="flex h-12 items-center overflow-hidden border border-stone-300 bg-orange-50 px-3 py-2.5 text-base text-neutral-500">
      {value}
    </div>
  );
}

function SoftTextarea({ value }: { value: string }) {
  return (
    <div className="flex h-52 items-start overflow-hidden border border-stone-300 bg-orange-50 p-3 text-base leading-6 text-neutral-500">
      {value}
    </div>
  );
}

function SelectField({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between border border-stone-300 bg-orange-50 p-3">
      <span className="text-base text-teal-950">{value}</span>
      <ChevronDown className="size-5 text-black" strokeWidth={1.8} />
    </div>
  );
}

function Token({ label }: { label: string }) {
  return (
    <div className="flex h-8 flex-1 items-center gap-2 bg-white px-3 py-1.5 text-sm text-zinc-900">
      <span>{label}</span>
      <span className="text-stone-500">x</span>
    </div>
  );
}

function UploadDropzone({
  title,
  subtitle,
  tall = false,
}: {
  title: string;
  subtitle: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-stone-300 bg-orange-50 ${
        tall ? "h-60" : "h-24"
      }`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <Upload className="size-5 text-orange-400" strokeWidth={2} />
        <div className="text-base leading-5 text-orange-400">{title}</div>
        <div className="text-sm leading-4 text-neutral-500">{subtitle}</div>
      </div>
    </div>
  );
}

function CompactSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center justify-between border border-stone-300 bg-stone-100 px-4 py-3">
      <span className="text-sm text-neutral-500">{placeholder}</span>
      <ChevronDown className="size-4 text-neutral-500" strokeWidth={1.8} />
    </div>
  );
}

function CompactInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex h-11 items-center overflow-hidden border border-stone-300 bg-stone-100 px-4 text-sm text-neutral-500">
      {placeholder}
    </div>
  );
}

function QuickInfoCard() {
  return (
    <div className="flex items-start gap-3 border border-stone-200 bg-white p-4">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-full border border-stone-300 text-green-900">
        <CircleHelp className="size-4" strokeWidth={1.8} />
      </div>
      <div className="space-y-1">
        <div className="text-base font-medium leading-6 text-zinc-900">Quick Info Card</div>
        <div className="text-xs leading-5 text-stone-500">
          Learn about royalties, distribution
          <br />
          options, and pricing structure.
        </div>
        <div className="flex items-center gap-1 pt-2.5 text-sm font-medium text-green-900">
          <span>View Author Program Guide</span>
          <Plus className="size-3 rotate-45" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function ContentHeader() {
  return (
    <div className="flex items-center justify-between border border-stone-200 bg-white px-4 py-2">
      <div className="text-2xl font-bold leading-7 text-zinc-900">Upload Content</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center justify-center border border-orange-400 bg-white px-6 py-3 text-base font-bold text-orange-400"
        >
          Save to draft
        </button>
        <button
          type="button"
          className="flex items-center justify-center bg-orange-400 px-6 py-3 text-base font-bold text-white"
        >
          Submit For Review
        </button>
      </div>
    </div>
  );
}

function DistributionOption({
  title,
  percentage,
  description,
  active = false,
}: {
  title: string;
  percentage: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex-1 p-5 ${
        active
          ? "bg-stone-100 outline outline-2 outline-offset-[-2px] outline-orange-400"
          : "bg-white outline outline-2 outline-offset-[-2px] outline-stone-300"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="text-2xl font-semibold leading-7 text-gray-800">{title}</div>
          <div
            className={`flex size-5 items-center justify-center rounded-full outline outline-2 outline-offset-[-2px] ${
              active ? "outline-orange-400" : "outline-stone-200"
            }`}
          >
            <div className={`size-2.5 rounded-full ${active ? "bg-orange-400" : "opacity-0 bg-orange-400"}`} />
          </div>
        </div>
        <div className={`text-2xl font-bold leading-7 ${active ? "text-orange-400" : "text-neutral-800"}`}>
          {percentage}
        </div>
        <div className="text-base leading-5 text-neutral-500">{description}</div>
      </div>
    </div>
  );
}

function RoyaltyPreview() {
  return (
    <div className="bg-green-900 p-6 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_20px_25px_-5px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-6">
        <div className="text-lg font-semibold leading-7 text-white">Royalty Preview</div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <span className="text-sm leading-4 text-white/80">List Price</span>
            <span className="text-base leading-5 text-white">$9.99</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <span className="text-sm leading-4 text-white/80">Royalty Percentage</span>
            <span className="text-base leading-5 text-amber-400">65%</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <span className="text-sm leading-4 text-white/80">Wonder Emporium Share</span>
            <span className="text-base leading-5 text-white">$3.50</span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-base font-bold leading-5 text-white">Author Earnings</span>
            <span className="text-3xl font-bold leading-9 text-amber-400">$6.49</span>
          </div>
          <div className="text-right text-sm leading-4 text-white/60">per copy sold</div>
        </div>
      </div>
    </div>
  );
}

export function AuthorUploadContentPage() {
  return (
    <div className="space-y-3">
      <ContentHeader />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <Card className="flex-1 rounded-none bg-white py-0 shadow-none ring-1 ring-stone-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold leading-7 text-zinc-800">Book Information</h2>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <SectionLabel label="Book Title" required />
                    <SoftInput value="The Architecture of Leadership" />
                  </div>

                  <div className="space-y-3">
                    <SectionLabel label="Book Description" required />
                    <SoftTextarea value="Write a compelling description for readers and reviewers." />
                  </div>

                  <div className="space-y-3">
                    <SectionLabel label="Tags / Keywords" />
                    <SoftInput value="leadership, business, strategy, growth" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium leading-5 text-zinc-900">Keywords & Tags</div>
                    <div className="flex min-h-12 flex-col gap-2 border border-stone-300 bg-stone-100 p-3">
                      <div className="flex gap-2">
                        <Token label="Keyword 01" />
                        <Token label="Keyword 01" />
                        <Token label="Keyword 01" />
                        <Token label="Keyword 01" />
                      </div>
                      <div className="text-sm text-neutral-500">Add a keyword...</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold leading-7 text-zinc-800">Publication Details</h2>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <SectionLabel label="Author Name" required />
                    <SoftInput value="Eleanor Vance" />
                  </div>

                  <div className="space-y-3">
                    <SectionLabel label="ISBN (Optional)" />
                    <SoftInput value="e.g. 978-3-16-148410-0" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="space-y-3">
                  <SectionLabel label="Book Category" required />
                  <SelectField value="Select category" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-3">
                    <SectionLabel label="Language" required />
                    <SelectField value="English" />
                  </div>
                  <div className="space-y-3">
                    <SectionLabel label="Age Group" required />
                    <SelectField value="Adult" />
                  </div>
                </div>

                <QuickInfoCard />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-none bg-white py-0 shadow-none ring-1 ring-stone-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold leading-7 text-zinc-800">Upload Book Image</h2>

              <div className="space-y-3">
                <SectionLabel label="Book Cover" required />
                <div className="relative h-60 overflow-hidden border border-stone-300 bg-orange-50">
                  <div className="absolute right-[78px] top-0 flex size-60 items-center justify-center">
                    <div className="h-[122px] w-[94px] bg-[linear-gradient(135deg,#d56a37_0%,#f3b24a_45%,#b8463a_45%,#b8463a_62%,#5e2d4a_62%,#d96e54_100%)] shadow-[0_8px_18px_rgba(0,0,0,0.18)]" />
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-[25px] left-3 flex h-9 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-neutral-500"
                  >
                    <FileUp className="size-4" strokeWidth={1.8} />
                    Browse
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <SectionLabel label="Upload Audiobook" />
                  <UploadDropzone
                    title="Drag & Drop Upload Audiobook"
                    subtitle="Supported Formats: PDF, DOCX, EPUB"
                  />
                </div>
                <div className="space-y-3">
                  <SectionLabel label="Page Count" required />
                  <SoftInput value="320" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <SectionLabel label="Upload eBook" />
                  <UploadDropzone
                    title="Drag & Drop Upload eBook"
                    subtitle="Supported Formats: PDF, DOCX, EPUB"
                  />
                </div>
                <div className="space-y-3">
                  <SectionLabel label="Page Count" required />
                  <SoftInput value="320" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <SectionLabel label="Upload Hardcover" />
                  <UploadDropzone
                    title="Drag & Drop Upload Hardcover"
                    subtitle="Supported Formats: PDF, DOCX, EPUB"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-800">
                      Trim Size <span className="text-red-900">*</span>
                    </div>
                    <CompactSelect placeholder="Select trim size..." />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-800">
                      Page Count <span className="text-red-900">*</span>
                    </div>
                    <CompactInput placeholder="e.g. 320" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <SectionLabel label="Upload Paperback" />
                  <UploadDropzone
                    title="Drag & Drop Upload Paperback"
                    subtitle="Supported Formats: PDF, DOCX, EPUB"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-800">
                      Trim Size <span className="text-red-900">*</span>
                    </div>
                    <CompactSelect placeholder="Select trim size..." />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-800">
                      Page Count <span className="text-red-900">*</span>
                    </div>
                    <CompactInput placeholder="e.g. 320" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none bg-white py-0 shadow-none ring-1 ring-stone-200">
        <CardContent className="flex flex-col gap-6 p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold leading-7 text-zinc-900">
              Pricing & Distribution Path
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <SectionLabel label="List Price (USD)" required />
              <SoftInput value="$ 9.99" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-base font-bold leading-5 text-neutral-800">
                Distribution Path <span className="text-red-600">*</span>
              </div>
              <div className="flex flex-col gap-4 xl:flex-row">
                <DistributionOption
                  title="WE Exclusive"
                  percentage="65%"
                  description="Maximum earnings. Your book is sold exclusively through the Wonder Emporium marketplace."
                  active
                />
                <DistributionOption
                  title="Wide Distribution"
                  percentage="45%"
                  description="Expanded reach. Distribute to Amazon, Barnes & Noble, and independent bookstores globally."
                />
              </div>
            </div>
          </div>

          <RoyaltyPreview />
        </CardContent>
      </Card>
    </div>
  );
}
