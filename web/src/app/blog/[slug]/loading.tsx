export default function LoadingPost() {
  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 rounded bg-neutral-200" />
          <div className="h-10 w-3/4 rounded bg-neutral-200" />
          <div className="h-4 w-1/2 rounded bg-neutral-200" />
          <div className="h-72 w-full rounded-3xl bg-neutral-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
