"use client";

import { useTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type BlogSearchFormProps = {
  actionPath?: string;
  staticParams?: Record<string, string | undefined>;
};

export const BlogSearchForm = ({ actionPath = "/blog", staticParams = {} }: BlogSearchFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(staticParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    if (q) {
      params.set("q", q);
      params.set("page", "1");
    } else {
      params.delete("q");
    }
    const query = params.toString();
    startTransition(() => router.push(query ? `${actionPath}?${params.toString()}` : actionPath));
  };

  return (
    <form action={handleSubmit} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2">
      <Search className="h-4 w-4 text-neutral-500" />
      <input
        type="search"
        name="q"
        placeholder="キーワードで検索"
        defaultValue={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-500"
        disabled={isPending}
      >
        検索
      </button>
    </form>
  );
};
