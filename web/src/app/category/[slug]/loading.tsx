export default function CategoryLoading() {
  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 rounded bg-neutral-200" />
          <div className="h-10 w-1/2 rounded bg-neutral-200" />
          <div className="h-4 w-2/3 rounded bg-neutral-200" />
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
