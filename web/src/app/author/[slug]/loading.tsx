export default function AuthorLoading() {
  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-24 w-full rounded-3xl bg-neutral-200" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-48 rounded-2xl bg-neutral-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
