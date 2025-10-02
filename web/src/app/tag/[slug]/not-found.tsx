import Link from "next/link";

export default function TagNotFound() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-900">タグが見つかりません</h1>
        <p className="text-neutral-600">指定されたタグは存在しないか、公開されていません。</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-500">
            トップへ戻る
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-neutral-300 px-6 py-2 text-sm font-semibold text-neutral-700 hover:border-primary-400 hover:text-primary-600"
          >
            記事一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
