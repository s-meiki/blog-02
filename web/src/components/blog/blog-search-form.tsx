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
    <form
      action={handleSubmit}
      className="flex items-center gap-3 rounded-full border border-primary-900/10 bg-white/90 px-5 py-2 shadow-soft backdrop-blur"
    >
      <Search className="h-4 w-4 text-primary-500" />
      <input
        type="search"
        name="q"
        placeholder="キーワードで検索"
        defaultValue={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
      />
      <button
        type="submit"
        className="rounded-full bg-primary-800 px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-70"
        disabled={isPending}
      >
        検索
      </button>
    </form>
  );
};
